import { expect, test } from "@playwright/test";

test.describe("responsive and print layouts", () => {
  test("keeps navigation and calculators usable on mobile", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(page.locator(".top-nav")).toBeVisible();
    await expect(page.getByRole("tab", { name: "Big purchase" })).toBeVisible();
    const columns = await page
      .locator(".grid")
      .evaluate((element) =>
        getComputedStyle(element)
          .gridTemplateColumns.split(" ")
          .filter(Boolean),
      );
    expect(columns).toHaveLength(1);

    await page.getByRole("tab", { name: "Results" }).click();
    await expect(page.locator(".results-page")).toBeVisible();
    const actionsFit = await page
      .locator(".results-actions")
      .evaluate((element) => {
        const buttons = [...element.querySelectorAll("button")];
        return buttons.every(
          (button) =>
            button.getBoundingClientRect().right <=
            element.getBoundingClientRect().right + 1,
        );
      });
    expect(actionsFit).toBe(true);
  });

  test("removes interactive controls from the print view", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: "Results" }).click();
    await page.emulateMedia({ media: "print" });

    await expect(page.locator(".results-actions")).toBeHidden();
    await expect(page.locator(".top-bar")).toBeHidden();
    await expect(page.locator(".top-nav")).toBeHidden();
    await expect(page.locator("aside")).toBeHidden();
    await expect(page.locator(".help-button").first()).toBeHidden();
    await expect(page.locator(".results-page")).toBeVisible();

    const detailColumns = await page
      .locator(".results-detail-grid")
      .evaluate((element) => getComputedStyle(element).gridTemplateColumns);
    expect(detailColumns.split(" ")).toHaveLength(2);

    const printStyles = await page
      .locator(".results-cards article")
      .first()
      .evaluate((element) => {
        const styles = getComputedStyle(element);
        return {
          breakInside: styles.breakInside,
          colorAdjust: styles.printColorAdjust,
        };
      });
    expect(printStyles.breakInside).toBe("avoid");
    expect(printStyles.colorAdjust).toBe("exact");
  });

  test("keeps Results accessible below 480px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    const resultsTab = page.getByRole("tab", { name: "Results" });
    await resultsTab.scrollIntoViewIfNeeded();
    await expect(resultsTab).toBeVisible();
    await resultsTab.click();
    await expect(page.locator(".results-page")).toBeVisible();
  });
});
