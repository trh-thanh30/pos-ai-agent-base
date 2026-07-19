import XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// Helper to decode HTML entities
function decodeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

// Helper to strip HTML tags from description
function stripHtml(html) {
  if (!html) return '';
  const decoded = decodeHtml(html);
  return decoded
    .replace(/<[^>]*>/g, ' ') // Replace HTML tags with space
    .replace(/\s+/g, ' ')     // Collapse multiple spaces
    .trim();
}

// Helper to delay execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log('=== STARTING GENSHAI CRAWLER ===');
  const targetUrl = 'https://genshai.com.vn/collections/all/products.json';
  let page = 1;
  const limit = 50;
  const allRows = [];
  let fetchedCount = 0;

  try {
    while (true) {
      console.log(`Fetching page ${page}...`);
      const url = `${targetUrl}?limit=${limit}&page=${page}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`Failed to fetch page ${page}. Status: ${response.status}`);
        break;
      }

      const data = await response.json();
      const products = data.products || [];
      
      if (products.length === 0) {
        console.log('No more products found. Finished crawling.');
        break;
      }

      fetchedCount += products.length;
      console.log(`Successfully fetched ${products.length} products (Total fetched: ${fetchedCount})`);

      for (const product of products) {
        const productTitle = decodeHtml(product.title || '');
        const parentCode = product.handle || ''; // Haravan uses handle as unique slug/code
        const categoryName = decodeHtml(product.product_type || '');
        const description = stripHtml(product.body_html || '');
        const imageUrl = product.images?.[0]?.src || product.image?.src || '';

        const variants = product.variants || [];
        
        for (const variant of variants) {
          // Determine unit (Đơn vị tính)
          // Haravan/Shopify stores use option1/option2/option3 for variant options.
          // By default, if option1 is "Default Title", it means no specific unit is defined.
          let unit = decodeHtml(variant.option1 || '');
          let variantName = decodeHtml(variant.title || '');

          if (unit === 'Default Title' || !unit) {
            unit = 'Cái'; // Default fallback unit
            variantName = ''; // Default title is not a real variant name
          }

          if (variantName.trim().toLowerCase() === unit.trim().toLowerCase()) {
            variantName = '';
          }

          const variantSku = variant.sku || '';
          const barcode = variant.barcode || '';
          const price = parseFloat(variant.price) || 0;
          const costPrice = 0; // Cost price is private and not exposed on frontend
          let initialStock = variant.inventory_quantity !== null && variant.inventory_quantity !== undefined 
            ? parseInt(variant.inventory_quantity, 10) 
            : 0;
          if (initialStock <= 0) {
            initialStock = 100;
          }

          // Excel columns row structure matching the image
          allRows.push({
            'Tên sản phẩm*': productTitle,
            'Mã sản phẩm': parentCode,
            'Đơn vị tính*': unit,
            'Tên danh mục': categoryName,
            'Mô tả sản phẩm': description,
            'Ảnh sản phẩm': imageUrl,
            'Tên biến thể*': variantName,
            'Mã biến thể (SKU)': variantSku,
            'Mã vạch (Barcode)': barcode,
            'Giá bán* (VND)': price,
            'Giá vốn (VND)': costPrice,
            'Tồn kho ban đầu': initialStock
          });
        }
      }

      page++;
      // Sleep to respect the server and prevent rate limits
      await delay(200);
    }

    console.log(`\nCrawling finished. Total products processed: ${fetchedCount}`);
    console.log(`Total variants (excel rows) generated: ${allRows.length}`);

    // Create Excel file
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(allRows);
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sach san pham');
    
    const excelFilename = 'genshai_products.xlsx';
    XLSX.writeFile(wb, excelFilename);
    console.log(`Saved Excel file to: ${path.resolve(excelFilename)}`);

    // Create CSV file
    const csvFilename = 'genshai_products.csv';
    const csvContent = XLSX.utils.sheet_to_csv(ws);
    fs.writeFileSync(csvFilename, csvContent, 'utf-8');
    console.log(`Saved CSV file to: ${path.resolve(csvFilename)}`);

    console.log('=== CRAWLER SUCCESSFUL ===');
  } catch (error) {
    console.error('An error occurred during crawling:', error);
  }
}

run();
