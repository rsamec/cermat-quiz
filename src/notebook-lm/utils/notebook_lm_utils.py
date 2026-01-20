from typing import List, Tuple
from notebooklm import NotebookLMClient, InfographicDetail, InfographicOrientation
import zipfile

def read_zip_directory_contents_flat(zip_file: str, directory_name: str) -> List[Tuple[str,str]]:
    results = []
    directory_name = directory_name.rstrip("/") + "/"

    with zipfile.ZipFile(zip_file, "r") as z:
        for info in z.infolist():
            if (
                info.filename.startswith(directory_name)
                and not info.is_dir()
                and "/" not in info.filename[len(directory_name):]
            ):
                filename_only = info.filename.split("/")[-1]
                with z.open(info.filename) as f:
                    results.append(
                        (filename_only, f.read().decode("utf-8"))
                    )

    return results


async def createWithSources(period:str, results: List[Tuple[str,str]]):    
    async with await NotebookLMClient.from_storage() as client:
        # List all notebooks
        notebooks = await client.notebooks.list()
        
        matched = next(filter((lambda x: period in x.title), notebooks), None)

        if matched is None:
            # Create a new notebook
            nb = await client.notebooks.create(period)
            print(f"Created: {nb.id}")            

            # Add sources
            for filename, content in results:
                print(f"{filename}")
                await client.sources.add_text(nb.id, filename,  content)                        
           
        else:            
            print(f"Already exists {matched.id}: {matched.title}")
       
async def generateArfifacts(period:str):    
    async with await NotebookLMClient.from_storage() as client:
        # List all notebooks
        notebooks = await client.notebooks.list()
        
        matched = next(filter((lambda x: period in x.title), notebooks), None)

        if matched is None:
             print(f"Notebook {period} does not exists exists. Use  createWithSources first")
        
        else:            
            print(f"Already exists {matched.id}: {matched.title}")

            # List and manage
            sources = await client.sources.list(matched.id)
            for src in sources:
                print(f"{src.id}: {src.title} ({src.source_type})")
                # # audio
                # status = await client.artifacts.generate_audio(matched.id, [src.id], "cs", custom_prompt)
                # final = await client.artifacts.wait_for_completion(matched.id, status.task_id)
                # print(f"NL: Download URL: {final.url}")
                # download_path = await client.artifacts.download_audio(matched.id, f"{period}.mp4")
                # print(f"Download URL: {download_path}")

                # infografics
                status = await client.artifacts.generate_infographic(matched.id, [src.id], "cs", None, InfographicOrientation.PORTRAIT, InfographicDetail.STANDARD)
                final = await client.artifacts.wait_for_completion(matched.id, status.task_id)
                print(f"Download URL: {final}")                


async def downloadArtifacts(period:str):    
    async with await NotebookLMClient.from_storage() as client:
        # List all notebooks
        notebooks = await client.notebooks.list()
        
        matched = next(filter((lambda x: period in x.title), notebooks), None)
        if matched is None:
             return []
        
        else:            
            # List and manage
            artifacts = await client.artifacts.list_infographics(matched.id)            
            for src in artifacts:

                # # audio
                # status = await client.artifacts.generate_audio(matched.id, [src.id], "cs", custom_prompt)
                # final = await client.artifacts.wait_for_completion(matched.id, status.task_id)
                # print(f"NL: Download URL: {final.url}")
                # download_path = await client.artifacts.download_audio(matched.id, f"{period}.mp4")
                # print(f"Download URL: {download_path}")

                # infografics                
                await client.artifacts.download_infographic(matched.id, f"artifacts/{period}/{src.title}.png", src.id)

        
            return artifacts

