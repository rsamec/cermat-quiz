import { test, expect } from '@playwright/test';
import { getTestUrl } from './test.utils';
import { quizes } from "../src/utils/quiz-utils.js";

const subjects = quizes.map(d => `${d.subject}-${d.period}`);
const out = "gen-screenshots"
//const colorSchemes = ['dark', 'light']
const colorScheme = 'dark';
const colors = ['Gray', 'Color']
const variants = subjects.flatMap(subject => colors.map(color => ({ color })).map(colors => ({ ...colors, subject })))
test.use({
  viewport: { width: 3200, height: 1200 },
  colorScheme
})
for (const { subject, color } of variants) {
  
  test(`cards ${subject} ${color}`, async ({ page }) => {

    await page.goto(getTestUrl(`quiz-sel-${subject}`));

    await page.getByText("Možnosti zobrazení", { selector: "details > summary" }).click();
    await page.getByLabel('Masonry').click();
    await page.getByRole('button', { name: color }).click();
    await page.getByLabel("Formulář").uncheck();

    await page.getByRole("button", { name: "Vybrat vše" }).first().click();


    const [newTab] = await Promise.all([
      page.waitForEvent("popup"),
      await page.getByRole('link', { name: 'share' }).click()
    ]);
    await page.goto(newTab.url());

    await page.locator('masonry-layout').first().screenshot({ path: `${out}/cards-masonry/${color}-${subject}.png` })

  });
}
for (const { subject, color } of variants) {
  //test.use({ ...scope, colorScheme: colorScheme })
  test(`sheets ${subject} ${color}`, async ({ page },) => {
    test.setTimeout(60_000);
    await page.goto(getTestUrl(`quiz-sel-${subject}`));

    await page.getByText("Filtrování úloh", { selector: "details > summary" }).click();
    await page.getByText("Možnosti zobrazení", { selector: "details > summary" }).click();
    
    //await page.getByLabel('Rok').selectOption("2024");

    
    
    await page.getByLabel('Sloupce').click();
    await page.getByRole('button', { name: color }).click();
    await page.getByLabel("Formulář").uncheck();


    await page.getByRole("button", { name: "Vybrat vše" }).first().click();


    const [newTab] = await Promise.all([
      page.waitForEvent("popup"),
      await page.getByRole('link', { name: 'share' }).click()
    ]);
    await page.goto(newTab.url());

    await page.locator('.multi-column').first().screenshot({ path: `${out}/sheet/${color}-${subject}.png` })

  });
}

for (const { subject, color } of variants.filter(d => d.subject.split('-')[0]== "math")) {
  //test.use({ ...scope, colorScheme: colorScheme })
  test(`cards-grid ${subject} ${color}`, async ({ page }) => {
    await page.goto(getTestUrl(`quiz-sel-${subject}`));
    await page.getByText("Filtrování úloh", { selector: "details > summary" }).click();
    //await page.getByLabel('Rok').selectOption(year.toString());
    //await page.getByLabel('Kategorie').selectOption(["Geometrie v rovině","Konstrukční úlohy"]);

    await page.getByText("Možnosti zobrazení", { selector: "details > summary" }).click();

    await page.getByLabel('Tabulka').click();
    await page.getByRole('button', { name: color }).click();
    await page.getByLabel("Formulář").uncheck();


    await page.getByRole("button", { name: "Vybrat vše" }).first().click();
    const [newTab] = await Promise.all([
      page.waitForEvent("popup"),
      await page.getByRole('link', { name: 'share' }).click()
    ]);
    await page.goto(newTab.url());

    await page.locator('.grid-column-auto').first().screenshot({ path: `${out}/cards-grid/${color}-${subject}.png` })

  })
}
