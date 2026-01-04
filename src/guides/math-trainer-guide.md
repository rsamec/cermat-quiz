---
title: React
sidebar: true
header: Ukázková aplikace - Matematický trenažér - návod
footer: false
pager: true
toc: true
---


# Ukázková aplikace matematický trenažér
*s návodem jak vytvořit jednoduše pomocí promtu v AI a využitím dat z  <a href="/inputs">banky úloh</a>*


Aplikace Matematický trenažér, který slouží jako průvodce rozborem řešení slovních úloh, lze vyzkoušet <a href="/math-trainer">zde</a>

Aplikace nabízí 2 základní obrazovky
- Přehled testů - (možnost označit/filterovat oblíbené testy, volba dark modu, ukládání stavu)
![alt text](image-7.png)

- Průvodce rozborem řešení úloh - (navigace/průchod jednotlivými úlohami/kroky řešení)
![alt text](image-9.png)



Uživatelské rozhraní aplikace (FE) je vytvořeno na základě promptů v prostředí <a href="https://gemini.google.com">Gemini</a>.
- Náhled/kód v gemini
![alt text](./image.png)
![alt text](./image-5.png)

Základní data, resp. jednotlivé testy, zadání úloh a postupy řešení úloh jsou použity z <a href="/inputs">banky úloh</a>. 
- zadání úloh je použíto přímo z banky úloh
- postupy řešení z banky úloh jsou předána ve strukturované podobě a AI je použita jen k transformaci ke srozumitelnějšímu textovému výstupu

## Vytvoření dat (testy, zadání úloh a postupy řešení)

```js run=false

const {
  values: { code, prompt, model }
} = parseArgs({
  options: {
    code: { type: "string" },
    prompt: { type: "string" },
    model: { type: "string" }
  }
});

const provider = {
  kind: "openai",
  model
}

const d = parseCode(code);
const baseUrl = `${baseDomainPublic}/${d.subject}/${d.period}/${code}`
const content = await text(`${baseUrl}/index.md`);

const rawContent = normalizeImageUrlsToAbsoluteUrls(content, [baseUrl])
const quiz = parseQuiz(rawContent);
const ids = quiz.questions.map(d => d.id);

const wordProblem = wordProblems[code] ?? {};
const wordProblemGroups = wordProblemGroupById(wordProblem);

const aiPrompts = [...Object.entries(wordProblemGroups)].map(([id, group]) => [id, generateAIMessages({
  template: quiz.content([parseInt(id)], { ids, render: 'content' }),
  deductionTrees: group.map(d => d.deductionTrees),  
}), quiz.content([parseInt(id)], { ids, render: 'content' })]);

async function main() {
  let data = {}

  for await (let [key, prompts, raw] of aiPrompts) {
      const response = await client.callAI(provider.kind, {
        model: provider.model,
        prompt: [{ role: "user", content: prompts[prompt] }],
        schema: ModelResponse,
        schemaName: prompt
      });
  

    if (response.success) {
      // Update the data with new key-value pair
      data[key] = {
        ...response.data,
        raw, 
      };
    }
    else {
      console.log(response.error)
    }

  }
  return data;
}

try {
  const output = await main();
  process.stdout.write(JSON.stringify(output, null, 2));
}
catch (err) {
  console.error("The sample encountered an error:", err);
};
```

## Zkopírování komponenty aplikace z Gemini

```jsx run=false
import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  CheckCircle2, 
  Lightbulb, 
  RefreshCw, 
  Award, 
  Home, 
  List, 
  Calculator, 
  LayoutGrid, 
  Target,
  Moon,
  Sun,
  Trash2,
  Trophy,
  Heart
} from 'lucide-react';

// --- KOMPLETNÍ DATOVÝ ARCHIV ---
const TEST_DATA = [
  {
    id: '2025-1-radny',
    title: '2025 - 1. řádný',
    tasks: [
      { id: '5.1', title: 'Úloha 5.1: Šířka domu', context: 'Pozemek c=30m. Půdorys domu má 5x menší obsah než pozemek. Délka a=c/2.', steps: [
        { label: 'Obsah pozemku', calculation: '30 * 30 = 900 m²', result: 'Pozemek má 900 m².' },
        { label: 'Obsah domu', calculation: '900 * 1/5 = 180 m²', result: 'Dům má 180 m².' },
        { label: 'Šířka b', analysis: 'a = 15m. b = S/a', calculation: '180 / 15 = 12 m', result: 'Šířka b je 12 m.' }
      ]},
      { id: '5.2', title: 'Úloha 5.2: Volná plocha', context: 'Rybníček tvoří 18 % pozemku (900 m²). Urči volnou plochu bez domu a rybníčku.', steps: [
        { label: 'Rybníček', calculation: '0.18 * 900 = 162 m²', result: 'Rybníček má 162 m².' },
        { label: 'Zbytek', calculation: '900 - (180 + 162) = 558 m²', result: 'Volná plocha je 558 m².' }
      ]}
    ]
  },
  {
    id: '2024-1-radny',
    title: '2024 - 1. řádný',
    tasks: [
      { id: '1', title: 'Úloha 1: Švadleny', context: '5 švadlen splní zakázku za 24 hodin. Za jak dlouho splní o polovinu větší zakázku 4 švadleny?', steps: [
        { label: 'Nepřímá úměra', calculation: '24 * 5/4 = 30 h', result: 'Původní práce trvá 30h.' },
        { label: 'Nová zakázka', calculation: '30 * 1.5 = 45 h', result: 'Nová zakázka potrvá 45h.' }
      ]}
    ]
  },
  {
    id: '2025-2-nahr',
    title: '2025 - 2. náhradní',
    tasks: [
      { id: '1', title: 'Úloha 1: Stuha na dárky', context: '3m stuha. 1. dárek 1/4 stuhy, 2. dárek 2/5 zbytku.', steps: [
        { label: 'Zbytek 1', calculation: '3 * 3/4 = 2.25 m', result: 'Zbývá 225 cm.' },
        { label: '3. dárek', analysis: 'Zbylo 3/5 z druhého zbytku.', calculation: '225 * 3/5 = 135 cm', result: 'Na 3. dárek zbývá 135 cm.' }
      ]}
    ]
  },
  {
    id: '2024-2-nahr',
    title: '2024 - 2. náhradní',
    tasks: [
      { id: '1', title: 'Úloha 1: Trasa kroky', context: '2.7 km. Adam má krok 75cm, Naďa 60cm.', steps: [
        { label: 'Naďa', calculation: '270000 / 60 = 4500 kroků', result: 'Naďa udělá 4500 kroků.' },
        { label: 'Adam', calculation: '270000 / 75 = 3600 kroků', result: 'Adam udělá 3600 kroků.' }
      ]}
    ]
  },
  {
    id: '2025-1-nahr',
    title: '2025 - 1. náhradní',
    tasks: [
      { id: '1', title: 'Úloha 1: Hmotnost', context: 'Kolikrát více je 5 kg než 0.25 g?', steps: [
        { label: 'Převod', calculation: '5000 / 0.25 = 20000', result: 'Je to 20 000x více.' }
      ]}
    ]
  }
];

export default function App() {
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [currentTaskIdx, setCurrentTaskIdx] = useState(0);
  const [visibleStepIdx, setVisibleStepIdx] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('math_guide_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [filterFavorites, setFilterFavorites] = useState(false);

  useEffect(() => {
    localStorage.setItem('math_guide_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (selectedTestId) {
      const savedState = localStorage.getItem(`math_guide_state_${selectedTestId}`);
      if (savedState) {
        const { tIdx, sIdx, finished } = JSON.parse(savedState);
        setCurrentTaskIdx(tIdx || 0);
        setVisibleStepIdx(sIdx || 0);
        setIsFinished(finished || false);
      } else {
        setCurrentTaskIdx(0);
        setVisibleStepIdx(0);
        setIsFinished(false);
      }
    }
  }, [selectedTestId]);

  useEffect(() => {
    if (selectedTestId) {
      const stateToSave = {
        tIdx: currentTaskIdx,
        sIdx: visibleStepIdx,
        finished: isFinished
      };
      localStorage.setItem(`math_guide_state_${selectedTestId}`, JSON.stringify(stateToSave));
    }
  }, [currentTaskIdx, visibleStepIdx, selectedTestId, isFinished]);

  const toggleFavorite = (id, e) => {
    if (e) e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const test = TEST_DATA.find(t => t.id === selectedTestId);
  const task = test?.tasks[currentTaskIdx];

  const handleNextStep = () => {
    if (visibleStepIdx < task.steps.length - 1) {
      setVisibleStepIdx(v => v + 1);
    } else {
      if (currentTaskIdx < test.tasks.length - 1) {
        setCurrentTaskIdx(c => c + 1);
        setVisibleStepIdx(0);
      } else {
        setIsFinished(true);
      }
    }
    // Scroll to bottom after state update
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const jumpToTask = (idx) => {
    setCurrentTaskIdx(idx);
    setVisibleStepIdx(0);
    setIsFinished(false);
    setShowTaskSelector(false);
    window.scrollTo(0, 0);
  };

  const resetProgressForTerm = () => {
    if (selectedTestId) {
      localStorage.removeItem(`math_guide_state_${selectedTestId}`);
      setCurrentTaskIdx(0);
      setVisibleStepIdx(0);
      setIsFinished(false);
      setShowTaskSelector(false);
    }
  };

  const resetToMenu = () => {
    setSelectedTestId(null);
    setCurrentTaskIdx(0);
    setVisibleStepIdx(0);
    setIsFinished(false);
    window.scrollTo(0, 0);
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const filteredTests = filterFavorites 
    ? TEST_DATA.filter(t => favorites.includes(t.id))
    : TEST_DATA;

  const themeClasses = {
    bg: isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#F8FAFC] text-slate-900',
    nav: isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100',
    card: isDarkMode ? 'bg-slate-900 border-slate-800 shadow-none' : 'bg-white border-indigo-50 shadow-sm',
    analysisBox: isDarkMode ? 'bg-amber-950/20 border-amber-900/40' : 'bg-amber-50 border-amber-100',
    calcBox: isDarkMode ? 'bg-indigo-950/20 border-indigo-900/40' : 'bg-indigo-50 border-indigo-100',
    footer: isDarkMode ? 'bg-slate-900 border-t border-slate-800' : 'bg-white border-t border-slate-100',
    buttonGhost: isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-50 text-slate-400',
    textMuted: isDarkMode ? 'text-slate-400' : 'text-slate-500'
  };

  if (!selectedTestId) {
    return (
      <div className={`min-h-screen transition-colors duration-300 font-sans pb-10 ${themeClasses.bg}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-12">
          <header className="mb-8 text-center relative">
            <div className="flex justify-between items-center mb-6">
              <button 
                onClick={toggleDarkMode}
                className={`p-3 rounded-xl transition-all ${isDarkMode ? 'bg-slate-800 text-amber-400' : 'bg-white text-slate-400 border border-slate-100 shadow-sm'}`}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button 
                onClick={() => setFilterFavorites(!filterFavorites)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase transition-all shadow-sm ${filterFavorites ? 'bg-red-500 text-white' : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-400 border border-slate-100'}`}
              >
                <Heart size={16} fill={filterFavorites ? "currentColor" : "none"} />
                {filterFavorites ? 'Oblíbené' : 'Vše'}
              </button>
            </div>

            <div className="inline-flex p-4 bg-indigo-600 rounded-2xl text-white shadow-lg mb-4">
              <Calculator size={32} strokeWidth={2.5} />
            </div>
            <h1 className={`text-3xl sm:text-5xl font-black mb-2 tracking-tighter uppercase ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>JPZ Matematika</h1>
            <p className={`text-sm sm:text-lg font-medium italic ${themeClasses.textMuted}`}>Interaktivní trenažér rozborů</p>
          </header>

          {filteredTests.length === 0 && filterFavorites ? (
            <div className="text-center py-20 opacity-50 px-6">
              <Heart size={48} className="mx-auto mb-4" />
              <p className="text-lg font-bold">Zatím nemáš žádné oblíbené termíny.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredTests.map((t) => {
                const isFav = favorites.includes(t.id);
                const savedState = localStorage.getItem(`math_guide_state_${t.id}`);
                let progress = null;
                if (savedState) {
                  const s = JSON.parse(savedState);
                  if (s.finished) progress = "Hotovo";
                  else {
                    const taskProgress = (s.tIdx / t.tasks.length) * 100;
                    progress = `${Math.max(1, Math.round(taskProgress))}%`;
                  }
                }
                
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTestId(t.id)}
                    className={`group p-5 rounded-2xl border transition-all text-left relative overflow-hidden active:scale-[0.98] ${themeClasses.card} hover:border-indigo-400`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                        <Target size={18} />
                      </div>
                      <div 
                        onClick={(e) => toggleFavorite(t.id, e)}
                        className={`p-2 rounded-lg transition-colors ${isFav ? 'text-red-500 bg-red-50/50' : 'text-slate-300 hover:bg-slate-100'}`}
                      >
                        <Heart size={20} fill={isFav ? "currentColor" : "none"} />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-1">
                      <h3 className={`text-lg font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{t.title}</h3>
                      {progress && (
                        <span className={`shrink-0 ml-2 px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${progress === "Hotovo" ? 'bg-green-500 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
                          {progress}
                        </span>
                      )}
                    </div>
                    <p className={`font-bold text-[10px] mb-4 uppercase tracking-wider ${themeClasses.textMuted}`}>{t.tasks.length} úloh</p>
                    
                    <div className={`flex items-center font-bold text-xs px-4 py-2 rounded-xl w-full justify-between transition-all ${isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-slate-50 text-indigo-600'}`}>
                      <span>{progress ? 'Pokračovat' : 'Začít studovat'}</span>
                      <ChevronRight size={14} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  const isCurrentFav = favorites.includes(selectedTestId);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 font-sans ${themeClasses.bg}`}>
      {/* Responzivní Horní Navigace */}
      <nav className={`border-b px-4 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm transition-colors duration-300 ${themeClasses.nav}`}>
        <button onClick={resetToMenu} className={`p-2 rounded-lg transition-colors ${themeClasses.buttonGhost}`}>
          <ChevronLeft size={24} />
        </button>
        
        <div className="flex flex-col items-center flex-1 mx-2 min-w-0">
          <div className="flex items-center gap-1.5 justify-center w-full overflow-hidden">
            <span className={`text-[9px] font-black uppercase tracking-wider truncate ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
              {test.title}
            </span>
            <button onClick={() => toggleFavorite(selectedTestId)} className={`${isCurrentFav ? 'text-red-500' : 'text-slate-300'}`}>
              <Heart size={12} fill={isCurrentFav ? "currentColor" : "none"} />
            </button>
          </div>
          <span className={`text-base font-black truncate w-full text-center ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            Úloha {task.id}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => setShowTaskSelector(!showTaskSelector)} className={`p-2 rounded-lg transition-colors ${showTaskSelector ? 'text-indigo-400 bg-indigo-500/10' : themeClasses.buttonGhost}`}>
            <List size={24} />
          </button>
        </div>
      </nav>

      {/* Task Selector Overlay */}
      {showTaskSelector && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 px-4 flex items-center justify-center" onClick={() => setShowTaskSelector(false)}>
          <div className={`w-full max-w-sm rounded-3xl shadow-2xl p-4 max-h-[80vh] overflow-y-auto transition-colors duration-300 animate-in slide-in-from-bottom-4 ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-3 mb-4 px-2">
              <p className={`text-[11px] font-black uppercase tracking-widest ${themeClasses.textMuted}`}>Seznam úloh</p>
              <button 
                onClick={resetProgressForTerm}
                className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-all flex items-center gap-1 text-[10px] font-black uppercase"
              >
                <Trash2 size={14} /> Smazat
              </button>
            </div>
            <div className="space-y-1">
              {test.tasks.map((t, idx) => (
                <button 
                  key={t.id} 
                  onClick={() => jumpToTask(idx)} 
                  className={`w-full text-left p-4 rounded-xl flex items-center justify-between transition-all group active:scale-95 ${currentTaskIdx === idx ? 'bg-indigo-600 text-white font-black' : isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-indigo-50 text-slate-600'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${currentTaskIdx === idx ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>{t.id}</span>
                    <span className="text-sm font-bold truncate max-w-[180px]">{t.title}</span>
                  </div>
                  {idx < currentTaskIdx && <CheckCircle2 size={16} className="text-green-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hlavní plocha */}
      <main className="flex-grow flex flex-col">
        {!isFinished ? (
          <div className="flex-grow flex flex-col">
            {/* Zadání */}
            <div className={`p-5 sm:p-8 border-b transition-colors duration-300 ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-indigo-50/30 border-indigo-50'}`}>
               <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>Matematika 9</span>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>Zadání</span>
               </div>
               <h2 className={`text-xl sm:text-2xl font-black leading-tight mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{task.title}</h2>
               <div className={`text-sm sm:text-base leading-relaxed font-medium p-4 rounded-xl border-l-4 border-indigo-500 transition-all duration-300 ${isDarkMode ? 'bg-slate-800/30 text-slate-300 border-slate-700' : 'bg-white text-slate-600 shadow-sm border-slate-100'}`}>
                 {task.context}
               </div>
            </div>

            {/* Kroky - Minimalizované mezery pro mobil */}
            <div className="p-4 sm:p-8 space-y-8 pb-32">
              {task.steps.map((step, idx) => (
                <div 
                  key={idx} 
                  className={`transition-all duration-500 transform ${idx <= visibleStepIdx ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95 pointer-events-none h-0 overflow-hidden'}`}
                >
                  <div className="flex gap-3 sm:gap-6">
                    <div className="flex flex-col items-center shrink-0">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm transition-all duration-700 ${idx < visibleStepIdx ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'}`}>
                        {idx < visibleStepIdx ? <CheckCircle2 size={16} /> : idx + 1}
                      </div>
                      {idx < task.steps.length - 1 && (
                        <div className={`w-0.5 flex-grow my-2 transition-colors duration-700 ${idx < visibleStepIdx ? (isDarkMode ? 'bg-green-900/50' : 'bg-green-200') : 'bg-slate-200 dark:bg-slate-800'}`} />
                      )}
                    </div>
                    <div className="flex-grow space-y-3">
                      <span className={`text-[10px] font-black uppercase tracking-wider block ${themeClasses.textMuted}`}>{step.label}</span>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                         <div className={`p-4 rounded-xl border transition-colors duration-300 ${themeClasses.analysisBox}`}>
                            <div className={`flex items-center gap-2 mb-1.5 font-black text-[9px] uppercase tracking-widest ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                               <Lightbulb size={14} /> Analýza
                            </div>
                            <p className={`text-sm font-bold leading-snug ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{step.analysis || "Logický rozbor situace."}</p>
                         </div>
                         <div className={`p-4 rounded-xl border transition-colors duration-300 ${themeClasses.calcBox}`}>
                            <div className={`font-black text-[9px] uppercase mb-2 tracking-widest ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Výpočet</div>
                            <p className={`text-lg font-mono font-black mb-2 tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{step.calculation}</p>
                            <div className={`h-[1px] w-full mb-2 transition-colors ${isDarkMode ? 'bg-indigo-500/20' : 'bg-indigo-200/50'}`} />
                            <p className={`font-black text-sm flex items-center gap-2 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-800'}`}>
                               <span className="bg-indigo-600 text-white text-[8px] px-1.5 py-0.5 rounded uppercase font-bold">Závěr</span>
                               {step.result}
                            </p>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Fixní spodní lišta pro akce na mobilu */}
            <div className={`fixed bottom-0 left-0 right-0 p-4 transition-colors duration-300 ${themeClasses.footer} z-40 sm:relative sm:bg-transparent sm:border-t-0`}>
              <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                <div className={`hidden sm:block font-black text-xs uppercase ${themeClasses.textMuted}`}>
                   {visibleStepIdx < task.steps.length - 1 ? "💡 Objev další krok" : "✅ Úloha hotova"}
                </div>
                <button 
                  onClick={handleNextStep}
                  className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 active:scale-95 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 text-lg"
                >
                  {visibleStepIdx < task.steps.length - 1 ? 'Další krok' : (currentTaskIdx < test.tasks.length - 1 ? 'Další úloha' : 'Dokončit')}
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-grow flex items-center justify-center p-6 pb-20">
            <div className={`w-full max-w-sm rounded-3xl border p-10 text-center transition-all duration-300 ${themeClasses.card} shadow-xl`}>
              <div className="w-20 h-20 bg-green-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
                <Award size={48} />
              </div>
              <h2 className={`text-3xl font-black mb-2 uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Hotovo!</h2>
              <p className={`text-sm font-medium opacity-80 mb-8 ${themeClasses.textMuted}`}>Prošel jsi rozbor všech úloh termínu {test.title}.</p>
              <div className="space-y-3">
                <button onClick={resetToMenu} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
                  <Home size={18} /> Hlavní nabídka
                </button>
                <button onClick={resetProgressForTerm} className={`w-full py-4 rounded-xl font-black border transition-all text-xs ${isDarkMode ? 'border-slate-800 text-slate-400 hover:bg-slate-800' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
                  Opakovat termín
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Responzivní Progress Bar (S fixní pozicí nad navigací na mobilu) */}
        {!isFinished && (
          <div className={`p-4 transition-colors duration-300 sticky bottom-[80px] sm:static sm:bg-transparent ${isDarkMode ? 'bg-slate-950/80 backdrop-blur-sm' : 'bg-slate-50/80 backdrop-blur-sm'}`}>
            <div className="max-w-4xl mx-auto">
               <div className={`flex justify-between text-[10px] font-black uppercase tracking-wider mb-2 ${themeClasses.textMuted}`}>
                  <span>Pokrok</span>
                  <span className={`font-black ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    {Math.round(((currentTaskIdx) / test.tasks.length) * 100 + ((visibleStepIdx + 1) / (task.steps.length * test.tasks.length)) * 100)} %
                  </span>
               </div>
               <div className={`h-2 rounded-full overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out shadow-sm"
                    style={{ width: `${((currentTaskIdx) / test.tasks.length) * 100 + ((visibleStepIdx + 1) / (task.steps.length * test.tasks.length)) * 100}%` }}
                  />
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
```


## Styly - tailwind

```html run=false
<script src="https://cdn.tailwindcss.com"></script>
```
## Vytvoření vlastní komponenty na renderování markdown zadání

```jsx run= false
import React, { useState, useEffect, useMemo } from 'npm:react';
/**
 * MarkdownRenderer
 * ----------------
 * Renders markdown content as HTML using markdown-it.
 *
 * Props:
 * - content: string (markdown source)
 * - className?: string (optional wrapper class)
 */
function MarkdownRenderer({
  content,
  options = {},
  className = "",
}) {
  const md = mdPlus;

  const renderedHtml = useMemo(() => {
    return md.renderToString(content || "");
  }, [md, content]);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}
```
## Použití vlastní komponenty MarkdownRenderer

```jsx run=false

<MarkdownRenderer
   content={task.rawContent}
   className="prose max-w-none"
 />

```

## Použití komponenty aplikace

```jsx run=false
display(<App />);
```