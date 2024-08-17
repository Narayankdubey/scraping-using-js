import puppeteer from "puppeteer";
import { createObjectCsvWriter } from "csv-writer";

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null
  });
  const page = await browser.newPage();

  const getPageData = async (pageNo, product) => {
    const url =
      pageNo > 1
        ? `https://www.amazon.in/s?k=${product}&page=${pageNo}&crid=2LI8LWEBVPZRR&qid=1723886754&sprefix=m%2Caps%2C1264&ref=sr_pg_1`
        : `https://www.amazon.in/s?k=${product}&crid=2LI8LWEBVPZRR&qid=1723886754&sprefix=m%2Caps%2C1264&ref=sr_pg_1`;
    // Navigate the page to a URL
    await page.goto(url);

    // Wait for the target divs to load
    await page.waitForSelector(
      "div.a-section.a-spacing-small.a-spacing-top-small"
    );

    // Extract titles and prices
    return await page.evaluate(() => {
      // Array to store extracted titles and prices
      const results = [];

      // Select all target div elements
      const divs = document.querySelectorAll(
        "div.a-section.a-spacing-small.a-spacing-top-small"
      );

      // Iterate over each div
      divs.forEach((div) => {
        // Extract title from span with specific class
        const titleElement = div.querySelector(
          "span.a-size-medium.a-color-base.a-text-normal"
        );
        const title = titleElement
          ? titleElement.textContent.trim()
          : "No title";

        // Extract price from span with specific class
        const priceElement = div.querySelector("span.a-price-whole");
        const price = priceElement
          ? priceElement.textContent.trim()
          : "No price";

        // Push the extracted title and price into the results array
        results.push({ title, price });
      });
      return results;
    });
  };

  const pageLimit = 20;
  const products = ["mobile", "laptop", "monitor", "headphone", "book"];
  let totalItems = [];

  for (const product of products) {
    totalItems.push({ title: product, price: "" });
    for (let i = 1; i <= pageLimit; i++) {
      const result = await getPageData(i, product);
      totalItems = [...totalItems, ...result];
    }
  }

  const csvWriter = createObjectCsvWriter({
    path: "data/amazon.csv", // Path where the CSV file will be saved
    header: [
      { id: "title", title: "Title" },
      { id: "price", title: "Price" }
    ]
  });

  // Write data to CSV file
  csvWriter
    .writeRecords(totalItems)
    .then(() => {
      console.log("CSV file has been written successfully");
    })
    .catch((err) => {
      console.error("Error writing CSV file:", err);
    });

  console.log(totalItems);
  await browser.close();
})();
