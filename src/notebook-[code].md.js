import { parseArgs } from "node:util";
import path from 'path';
import { readJsonFromFile } from './utils/file.utils.js';
import { baseMediaPublic, formatCode } from './utils/quiz-string-utils.js';

const {
  values: { code }
} = parseArgs({
  options: { 
    code: { type: "string" },
  }
});
const aiCategoriesData = await readJsonFromFile(path.resolve(`./src/data/quiz-categories-gemini-2.5-flash.json`));
const aiCategories = aiCategoriesData[code]?.questions ?? [];

const notebookVideosData = await readJsonFromFile(path.resolve(`./src/data/notebook-videos.json`));
const notebookVideos = notebookVideosData[code] ?? [];




const videos = notebookVideos.map(d => {
  const { name, summary: description, id } = aiCategories.find(x => x.id == d.id) ?? {};
  return {
    video: `${baseMediaPublic}/${code}/${d.fileName}`,
    name,
    id,
    description
  }
})

process.stdout.write(`---
title: Slovní úlohy
sidebar: true
header: false
footer: false
pager: false
toc: false
style: /assets/css/carousel.css
---


# ${formatCode(code)}

${videos.length === 0 
  ? `<div class="warning">There are no videos available</div>`
  : `<div class="carousel carousel--scroll-markers carousel--inert">
  ${videos.map(({ video, name, description, id }, i) => `<div class="carousel__slide" data-label=a${i}>    
    <figure class="parallax-item" role="tabpanel">      
      <video src=${video} muted loop controls></video>
     <figcaption>
     <h2>${id} - ${name}</h2>     
     ${description}
     </figcaption> </figure>
  </div>`).join("")}  
</div>`}`)