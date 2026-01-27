import { expect } from "../utils/custom-expect";
import { accessTest, test } from "../utils/fixtures";

test.describe('Accessibility Tests', () => {
  accessTest('should have no accessibility violations', async ({ page, makeAxeBuilder }) => {
    await page.goto('https://cerios.nl/');

    // Run accessibility scan
    const accessibilityScanResults = await makeAxeBuilder()
        .withTags([''])
        .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});