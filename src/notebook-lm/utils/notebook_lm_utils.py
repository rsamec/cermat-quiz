from typing import Dict, List, Tuple, Any
from notebooklm import NotebookLMClient, InfographicDetail, InfographicOrientation, AudioFormat, AudioLength
import zipfile
import asyncio
from PIL import Image

initial_interval = 2.0
max_interval = 30.0
timeout = 1000
between_generation_delay = 1

custom_prompt = """You are an academic dialogue coach for math.
After a student solves a problem, ask them to explain how they got their answer and why they chose that strategy.
Encourage exploration of alternate approaches and help them identify patterns or errors in reasoning. 
Keep the tone curious and supportive.
- try to add some jokes"""

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

async def getNotebookId(period:str) -> str:
    async with await NotebookLMClient.from_storage() as client:
        # List all notebooks
        notebooks = await client.notebooks.list()
        
        matched = next(filter((lambda x: period in x.title), notebooks), None)

        if matched is None:
            raise ValueError(f"Does not exist {period}")
        else:
            return matched.id

async def createWithSources(period:str, results: List[Tuple[str,str]]) -> str:    
    async with await NotebookLMClient.from_storage() as client:
        # List all notebooks
        notebooks = await client.notebooks.list()
        
        matched = next(filter((lambda x: period in x.title), notebooks), None)

        if matched is None:
            # Create a new notebook
            nb = await client.notebooks.create(period)            

            # Add sources
            for filename, content in results:
                await client.sources.add_text(nb.id, filename,  content)   
            return nb.id
           
        else:
            # raise ValueError(f"Already exists {matched.id}: {matched.title}")
            return matched.id                        
       
async def generateArfifacts(id:str, result :dict[str,int],  opt: dict[str, bool], waitForComplation: bool) -> dict[str,int]:
    async with await NotebookLMClient.from_storage() as client:
        # List and manage
        sources = await client.sources.list(id)
        for src in sources:
            artifacts = []
            # artifact_ids = get_artifacts_by_source(result, src.id)            
            # for artifact_id in artifact_ids:
            #     artifacts.append(await client.artifacts.get(id, artifact_id))
            # print(f"{src}, {artifact_ids}")

            # audio
            if opt["audio"] and not any(d.kind == "audio" for d in artifacts):                
                status = await client.artifacts.generate_audio(id, [src.id], "cs", custom_prompt, AudioFormat.DEEP_DIVE, AudioLength.SHORT)
                if waitForComplation:
                    await client.artifacts.wait_for_completion(id, status.task_id, initial_interval, max_interval, timeout)
                else:
                    await asyncio.sleep(between_generation_delay)  # second(s) delay
                result[status.task_id] = int(src.title.split(".")[0])
            
            # infografics
            if opt["infographic"] and not any(d.kind == "infographic" for d in artifacts):
                status = await client.artifacts.generate_infographic(id, [src.id], "cs", None, InfographicOrientation.PORTRAIT, InfographicDetail.STANDARD)
                if waitForComplation:
                    await client.artifacts.wait_for_completion(id, status.task_id, initial_interval, max_interval, timeout)
                else:
                    await asyncio.sleep(between_generation_delay)  # second(s) delay
                result[status.task_id] = int(src.title.split(".")[0])
        
        return result

async def downloadArtifacts(id:str, dir_name:str, artifact_source :dict[str,int]) -> List[Any]:    
    async with await NotebookLMClient.from_storage() as client:    
        save_location_root_dir = "artifacts"
        dowloaded_artifacts:List[Tuple[Any,Any]] = []
        
        # List and manage audios
        artifacts = await client.artifacts.list_audio(id)
        for artifact in artifacts:
            source = artifact_source.get(artifact.id)
            if source is not None:
                # audios         
                saveLocation = f"{save_location_root_dir}/{dir_name}/{artifact.title}"
                await client.artifacts.download_audio(id,f"{saveLocation}.m4a" , artifact.id)
                dowloaded_artifacts.append((source, artifact))
            else:
                continue

        # List and manage infographics
        artifacts = await client.artifacts.list_infographics(id)
        for artifact in artifacts:
            source = artifact_source.get(artifact.id)
            if source is not None:
                # infografics         
                saveLocation = f"{save_location_root_dir}/{dir_name}/{artifact.title}"
                await client.artifacts.download_infographic(id,f"{saveLocation}.png" , artifact.id)
                img = Image.open(f"{saveLocation}.png")
                img.save(
                    f"{saveLocation}.webp",
                    format="WEBP",
                    quality=85,      # 0–100 (higher = better quality)
                    method=6         # best compression (0–6)
                )
                dowloaded_artifacts.append((source, artifact))
            else:
                continue

        return dowloaded_artifacts


def get_artifacts_by_source(
    existing_source: Dict[str, Any],
    source_id: Any
) -> List[str]:
    """
    Returns all artifacts_id whose value equals the given source_id.
    """
    return [
        artifacts_id
        for artifacts_id, id in existing_source.items()
        if id == source_id and not artifacts_id
    ]
