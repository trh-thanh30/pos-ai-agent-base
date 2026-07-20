# Kế hoạch thiết kế lại Retail Storefront và Website Configurator

## 1. Mục tiêu

Thiết kế lại hệ thống website bán hàng theo subdomain để mỗi cửa hàng retail có thể:

- Chọn một template phù hợp với ngành hàng thay vì chỉ đổi cách xếp lưới.
- Tùy biến nhận diện thương hiệu đủ sâu nhưng vẫn dễ sử dụng.
- Xem trước thay đổi theo desktop/mobile trước khi công khai.
- Lưu bản nháp, xuất bản và quay lại phiên bản cấu hình đang hoạt động.
- Bán hàng bằng một luồng đặt hàng thật, không tạo mã đơn giảđu ở trình duyệt.
- Có storefront nhanh, responsive, dễ truy cập, thân thiện SEO và nhất quán.
- Mở rộng thêm template/section/config mà không tiếp tục phình một component duy nhất.

Kết quả mong muốn là một "storefront platform" nhỏ có cấu trúc rõ ràng, không chỉ là ba nhánh JSX trong cùng một file.

## 2. Phạm vi

### Trong phạm vi

- Trang cấu hình website online trong dashboard.
- Storefront public theo subdomain.
- Template registry và các template retail mới.
- Cấu hình brand, layout, nội dung, catalog, header/footer, checkout, SEO và social.
- Upload/chọn ảnh qua hệ thống Asset hiện có.
- Draft, preview, publish và version cấu hình.
- Public storefront API và public order API cần cho trải nghiệm mua hàng.
- Responsive, accessibility, SEO, performance, analytics cơ bản và test.
- Migration từ `retail_config` hiện tại sang cấu trúc v2.

### Ngoài phạm vi giai đoạn đầu

- Trình kéo thả tự do kiểu page builder.
- Custom domain hoàn chỉnh ngoài subdomain.
- Theme marketplace cho bên thứ ba.
- CMS blog đầy đủ.
- Thanh toán online qua payment gateway có webhook.
- Quản lý vận chuyển đa đối tác.
- Đa ngôn ngữ/đa tiền tệ.

Những hạng mục ngoài phạm vi vẫn cần được giữ chỗ trong data model để tránh khóa đường mở rộng.

## 3. Hiện trạng đã rà soát

### Storefront

File chính:

- `apps/web/main/src/app/sites/[subdomain]/StorefrontClient.tsx`

Vấn đề hiện tại:

- Component dài hơn 1.000 dòng, chứa template, filter, cart và checkout trong cùng file.
- Ba template dùng chung gần như toàn bộ ngôn ngữ hình ảnh; khác biệt chủ yếu là bố cục sản phẩm.
- Màu thương hiệu chỉ được chèn trực tiếp bằng `style={{ backgroundColor }}` tại một số vị trí.
- Header, footer, cart drawer và checkout không có biến thể theo template.
- Typography, spacing, border radius và image ratio chưa được định nghĩa thành design token.
- Ảnh mặc định lấy trực tiếp từ URL bên ngoài; thiếu chiến lược fallback và tối ưu ảnh.
- Sản phẩm có variant nhưng thao tác thêm giỏ hàng thường bỏ qua bước chọn variant.
- Search/filter chỉ chạy trên tối đa 48 sản phẩm đã fetch ở trang đầu.
- Checkout chỉ sinh mã đơn ngẫu nhiên trên client; chưa tạo đơn hàng thật trong hệ thống.
- Chưa có loading skeleton, product detail, URL state, pagination/infinite loading hoặc xử lý tồn kho đầy đủ.

### Configurator trong dashboard

File chính:

- `apps/web/main/src/sections/dashboard/components/info-online-store.tsx`

Config hiện tại chỉ gồm:

- Bật/tắt website.
- Subdomain.
- Template: `classic`, `ecommerce`, `restaurant`.
- Một màu chính.
- URL logo và banner.
- Facebook và TikTok.

Vấn đề hiện tại:

- Form dài theo chiều dọc, chưa có navigation theo nhóm cấu hình.
- Không có live preview.
- Không phân biệt draft với bản đang publish.
- Người dùng phải dán URL ảnh dù repo đã có API upload Asset.
- Không cảnh báo thay đổi chưa lưu.
- Không có reset, duplicate theme, undo hoặc khôi phục bản publish.
- Không có cấu hình section, content, catalog, checkout, SEO và footer.
- Dùng nhiều local state và `any`, khó mở rộng và validate toàn form.

### Data/API

- `Store.retail_config` đang là `Json` với cấu trúc phẳng.
- DTO và Zod schema chỉ biết các field cấu hình cũ.
- Public store API trả storefront data nhưng chưa có contract riêng được version hóa.
- Chưa có API public riêng cho việc tạo đơn từ storefront.
- Chưa có revision để lưu draft/published config hoặc lịch sử publish.

## 4. Nguyên tắc thiết kế

Kế hoạch áp dụng định hướng từ skill `frontend-ui-ux` theo cách phù hợp với hai bối cảnh khác nhau.

### Storefront public

- Mỗi template phải có một art direction mạnh, dễ nhận ra ngay trong viewport đầu.
- Template không chỉ đổi màu và grid; phải khác về typography, nhịp spacing, cách dùng ảnh, header, product card và cách duyệt catalog.
- Không dùng palette tím gradient trên nền trắng hoặc bố cục SaaS chung chung.
- Typography phải có cá tính, nhưng hỗ trợ đầy đủ tiếng Việt và được tải bằng `next/font`.
- Chỉ dùng motion ở các điểm có giá trị: page reveal, mở cart, đổi ảnh, thêm sản phẩm.
- Ưu tiên hình ảnh sản phẩm/cửa hàng thật; không dùng background trang trí làm lu mờ sản phẩm.

### Admin configurator

- Tone: industrial/utilitarian, yên tĩnh, rõ trạng thái, tối ưu cho tác vụ lặp lại.
- Không biến phần cài đặt thành landing page hoặc chuỗi card trang trí.
- Dùng sidebar/tab để điều hướng nhóm config, control phù hợp với kiểu dữ liệu và sticky action bar.
- Preview phải là trung tâm của workflow, không phải một link mở tab mới sau khi lưu.
- Progressive disclosure: cấu hình phổ biến hiện trước, tùy chọn nâng cao nằm trong nhóm riêng.
- Mọi control phải có default hợp lý và preview tức thời.

### Điểm ghi nhớ

"Chọn template theo cách cửa hàng muốn khách mua sắm, sau đó tinh chỉnh thương hiệu trong preview trực tiếp."

## 5. Định hướng template v2

Không nên tiếp tục dùng tên `classic/ecommerce/restaurant` cho retail. Đề xuất ba template retail v2, đồng thời giữ adapter cho ID cũ trong quá trình migration.

### 5.1. `market`

Đối tượng:

- Cửa hàng tạp hóa, minimart, đồ gia dụng, shop có nhiều SKU.

Tone:

- Industrial/utilitarian.

Đặc điểm:

- Header gọn, search là hành động chính.
- Category rail rõ và sticky trên desktop.
- Product grid dày, giá và trạng thái hàng nổi bật.
- Quick add, quantity stepper ngay trên card.
- Cart drawer tối ưu thao tác nhanh.
- Có khu vực deal/bán chạy nhưng không dùng hero quá cao.
- Mobile có search sticky và cart bar dưới màn hình.

Điểm ghi nhớ:

- Mua nhanh, nhìn thấy nhiều sản phẩm mà vẫn dễ quét.

### 5.2. `editorial`

Đối tượng:

- Thời trang, mỹ phẩm, phụ kiện, lifestyle.

Tone:

- Editorial/magazine, refined.

Đặc điểm:

- Hero dùng ảnh thật của brand với text overlay.
- Typography display có cá tính, body font dễ đọc.
- Grid ảnh lớn, khoảng trắng có chủ đích.
- Section lookbook, bộ sưu tập nổi bật và storytelling ngắn.
- Product card hạn chế viền, ưu tiên ảnh và tên sản phẩm.
- Product quick view có gallery, variant swatch và mô tả.
- Header chuyển trạng thái khi scroll nhưng không che nội dung.

Điểm ghi nhớ:

- Cửa hàng trông như một thương hiệu riêng, không giống trang POS được public ra web.

### 5.3. `specialist`

Đối tượng:

- Điện tử, mẹ và bé, thể thao, sản phẩm có nhiều thông số/variant.

Tone:

- Precise, technical, trustworthy.

Đặc điểm:

- Search và category mega panel rõ ràng.
- Product card hiển thị badge, variant summary, giá từ và tồn kho.
- Cho phép bật bảng đặc điểm ngắn trên card/detail.
- Product detail ưu tiên so sánh variant và thông tin kỹ thuật.
- Có section thương hiệu, cam kết, chính sách đổi trả.
- Layout cân bằng giữa độ dày thông tin và khả năng đọc.

Điểm ghi nhớ:

- Khách hiểu đủ thông tin để tự tin chọn đúng phiên bản sản phẩm.

### Xử lý template `restaurant`

`restaurant` không nên là template mặc định của retail v2. Có hai lựa chọn ở decision gate:

1. Giữ dưới dạng legacy cho các store đang dùng, không cho store retail mới chọn.
2. Di chuyển sang storefront riêng của domain restaurant khi domain đó triển khai online ordering.

Khuyến nghị chọn phương án 1 trước để migration an toàn.

## 6. Kiến trúc thông tin của configurator

Route hiện tại có thể giữ nguyên, nhưng nội dung chuyển thành workspace hai vùng.

### Desktop

- Thanh trên: tên website, trạng thái draft/published, URL, mở storefront, undo, save draft, publish.
- Sidebar trái rộng khoảng 280-320 px: các nhóm setting.
- Preview bên phải: iframe storefront preview, có switch desktop/tablet/mobile.
- Sidebar có thể thu gọn để tăng diện tích preview.

### Mobile/tablet

- Settings và preview chuyển thành hai tab.
- Action bar sticky dưới màn hình.
- Preview dùng viewport mô phỏng nhưng không ép nội dung vượt chiều ngang.

### Nhóm cấu hình

1. `Tổng quan`
2. `Mẫu giao diện`
3. `Thương hiệu`
4. `Trang chủ`
5. `Danh mục & sản phẩm`
6. `Header & điều hướng`
7. `Giỏ hàng & đặt hàng`
8. `Footer & liên hệ`
9. `SEO & chia sẻ`
10. `Nâng cao`

### Trạng thái editor

- `Saved`: draft trên server trùng với state hiện tại.
- `Unsaved`: local state có thay đổi.
- `Saving`: đang lưu draft.
- `Draft`: draft khác bản published.
- `Publishing`: đang publish.
- `Published`: revision hiện tại đang public.
- `Error`: save/publish thất bại, giữ nguyên local state.

Khi rời trang với thay đổi chưa lưu phải có confirm dialog.

## 7. Danh mục cấu hình v2

### 7.1. Tổng quan

- `enabled`: website public hay private.
- `subdomain`: subdomain cửa hàng.
- `store_name_override`: tên hiển thị riêng trên web, mặc định lấy `Store.name`.
- `announcement.enabled`.
- `announcement.text`.
- `announcement.link_label`.
- `announcement.link_url`.
- `announcement.dismissible`.
- `contact.phone_override`.
- `contact.email`.
- `contact.address_override`.
- `contact.business_hours_override`.

### 7.2. Template

- `template.id`: `market | editorial | specialist`.
- `template.version`: version của template.
- `template.density`: `compact | comfortable`.
- `template.product_card`: các biến thể được template hỗ trợ.
- `template.image_ratio`: `square | portrait | landscape`.

Chỉ hiển thị option hợp lệ theo template, không cho nhập tổ hợp gây vỡ layout.

### 7.3. Brand

- `brand.logo_asset_id`.
- `brand.logo_url` làm fallback trong thời gian migration.
- `brand.favicon_asset_id`.
- `brand.hero_asset_id`.
- `brand.primary_color`.
- `brand.accent_color`.
- `brand.background_color`.
- `brand.surface_color`.
- `brand.text_color`.
- `brand.heading_font`.
- `brand.body_font`.
- `brand.radius`: `sharp | soft | rounded`.
- `brand.button_style`: `solid | outline`.

Yêu cầu:

- Sinh palette semantic từ màu brand nhưng phải kiểm tra contrast.
- Có preset palette được thiết kế sẵn.
- Color picker gồm swatch, hex input và cảnh báo contrast.
- Font picker chỉ chứa font đã whitelist, hỗ trợ tiếng Việt và được bundle bằng `next/font`.

### 7.4. Trang chủ và section

Config section dùng mảng có thứ tự:

- `id`: UUID ổn định.
- `type`: loại section.
- `enabled`.
- `order`.
- `settings`: config theo từng loại.

Section v2:

- `hero`.
- `featured_categories`.
- `featured_products`.
- `new_arrivals`.
- `best_sellers`.
- `promotion_banner`.
- `collection_spotlight`.
- `brand_story`.
- `trust_benefits`.
- `newsletter` để dành, chưa bật nếu chưa có backend.

Admin có thể:

- Bật/tắt section.
- Kéo thả đổi thứ tự bằng keyboard-accessible sortable control.
- Chọn category/product/collection thực tế.
- Sửa heading, supporting copy và CTA.
- Chọn layout variant do template cung cấp.
- Xem trạng thái empty ngay trong preview.

Không cho tự do đặt mọi block ở mọi vị trí. Template định nghĩa slot và constraint để luôn giữ chất lượng hình ảnh.

### 7.5. Catalog

- `catalog.default_sort`: `featured | newest | price_asc | price_desc | name`.
- `catalog.show_search`.
- `catalog.show_category_filter`.
- `catalog.show_stock_status`.
- `catalog.show_out_of_stock`.
- `catalog.show_product_description`.
- `catalog.show_compare_at_price`.
- `catalog.products_per_page`: whitelist `24 | 36 | 48`.
- `catalog.quick_add`.
- `catalog.quick_view`.
- `catalog.category_ids`: category được public; rỗng nghĩa là tất cả.
- `catalog.featured_product_ids`.

### 7.6. Product detail

Storefront v2 cần route sản phẩm có URL ổn định, ví dụ:

- `/products/[productId]`

Config:

- `product.show_gallery`.
- `product.show_sku`.
- `product.show_stock_quantity`.
- `product.show_description`.
- `product.show_store_policy`.
- `product.variant_selector`: `buttons | select | swatches`.
- `product.related_products.enabled`.
- `product.related_products.heading`.

Tên slug có thể được bổ sung sau; giai đoạn đầu dùng ID để tránh migration lớn.

### 7.7. Header và navigation

- `header.style`: option theo template.
- `header.sticky`.
- `header.show_logo`.
- `header.show_store_name`.
- `header.show_search`.
- `header.show_phone`.
- `header.navigation`: danh sách menu có label, type và target.

Menu type:

- Home.
- Category.
- Section anchor.
- External URL.

Giới hạn số item top-level để tránh vỡ header. Item dư chuyển vào menu "Thêm".

### 7.8. Giỏ hàng và đặt hàng

- `checkout.enabled`.
- `checkout.fulfillment_methods`: `pickup`, `local_delivery`.
- `checkout.default_fulfillment`.
- `checkout.require_customer_name`.
- `checkout.require_phone`.
- `checkout.require_address`.
- `checkout.allow_note`.
- `checkout.payment_methods`: `cod`, `bank_transfer`.
- `checkout.minimum_order_amount`.
- `checkout.success_message`.
- `checkout.policy_text`.

Luồng bắt buộc:

1. Khách chọn product/variant hợp lệ.
2. Client kiểm tra quantity theo stock snapshot.
3. Client gửi public checkout request.
4. Server xác minh store đang publish, product/variant, giá và tồn kho.
5. Server tạo Order + OrderItem bằng transaction.
6. Server sinh order number chính thức.
7. Server trả payment instruction cần thiết cho đúng order.
8. Client hiển thị success/QR.

Không tiếp tục sinh mã `DHxxxxxx` ngẫu nhiên trên client.

### 7.9. Footer, contact và social

- `footer.style`.
- `footer.show_brand`.
- `footer.show_contact`.
- `footer.show_business_hours`.
- `footer.show_powered_by`.
- `footer.policy_links`.
- `social.facebook_url`.
- `social.instagram_url`.
- `social.tiktok_url`.
- `social.youtube_url`.
- `social.zalo_url`.

`Powered by NexPOS` mặc định bật; quyền tắt có thể phụ thuộc gói dịch vụ sau này.

### 7.10. SEO và chia sẻ

- `seo.title`.
- `seo.description`.
- `seo.og_asset_id`.
- `seo.noindex` chỉ dùng khi preview/private.
- Canonical URL tự sinh từ subdomain.
- Open Graph và Twitter metadata.
- JSON-LD `LocalBusiness`/`Store`.
- Sitemap cho home, category và product public.
- `robots.txt` phù hợp trạng thái publish.

### 7.11. Nâng cao

- `advanced.custom_css`: chưa triển khai ở v2 đầu tiên vì rủi ro phá layout/security.
- `advanced.analytics_id`: chỉ whitelist provider và format khi triển khai.
- `advanced.hide_out_of_stock`.
- `advanced.image_fit`.

Custom CSS chỉ nên mở ở phase sau, có scope sandbox, sanitization, giới hạn dung lượng và nút reset.

## 8. Data model đề xuất

Không nên tiếp tục chỉ ghi đè một JSON phẳng trong `Store`. Đề xuất:

```prisma
model Storefront {
  id                    String   @id @default(uuid()) @db.Uuid
  store_id              String   @unique @db.Uuid
  enabled               Boolean  @default(false)
  subdomain             String?  @unique @db.VarChar(100)
  published_revision_id String?  @db.Uuid
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  store                 Store    @relation(fields: [store_id], references: [id], onDelete: Cascade)
  revisions             StorefrontRevision[]
}

model StorefrontRevision {
  id            String   @id @default(uuid()) @db.Uuid
  storefront_id String   @db.Uuid
  version       Int
  status        String
  schema_version Int     @default(2)
  config        Json
  created_by    String?  @db.Uuid
  createdAt     DateTime @default(now())
  publishedAt   DateTime?

  storefront Storefront @relation(fields: [storefront_id], references: [id], onDelete: Cascade)

  @@unique([storefront_id, version])
  @@index([storefront_id, status])
}
```

Nếu cần giảm scope cho phase đầu:

- Giữ `Store.subdomain`.
- Thêm `storefront_draft_config`, `storefront_published_config`, `storefront_schema_version`.

Khuyến nghị dài hạn vẫn là hai bảng riêng vì revision/publish là một lifecycle độc lập với thông tin cửa hàng.

### Config contract

```ts
interface StorefrontConfigV2 {
  schemaVersion: 2;
  template: TemplateConfig;
  brand: BrandConfig;
  announcement: AnnouncementConfig;
  home: {
    sections: StorefrontSection[];
  };
  catalog: CatalogConfig;
  product: ProductPageConfig;
  header: HeaderConfig;
  checkout: CheckoutConfig;
  footer: FooterConfig;
  contact: ContactConfig;
  social: SocialConfig;
  seo: SeoConfig;
}
```

Yêu cầu contract:

- Có Zod schema dùng chung cho web và API nếu package boundary cho phép.
- API vẫn dùng DTO/class-validator ở transport boundary, sau đó parse lại bằng schema domain.
- Mọi version có hàm migrate rõ ràng.
- Không dùng `any`.
- Không lưu key có giá trị `undefined`.
- Default config được tạo từ template registry, không rải trong UI component.

## 9. Kiến trúc frontend đề xuất

```text
apps/web/main/src/features/storefront/
├── config/
│   ├── defaults.ts
│   ├── fonts.ts
│   ├── migrations.ts
│   ├── schema.ts
│   └── types.ts
├── registry/
│   ├── section-registry.ts
│   └── template-registry.ts
├── runtime/
│   ├── storefront-provider.tsx
│   ├── storefront-renderer.tsx
│   ├── theme-style.tsx
│   └── use-storefront-theme.ts
├── templates/
│   ├── market/
│   ├── editorial/
│   └── specialist/
├── sections/
│   ├── hero-section.tsx
│   ├── featured-categories-section.tsx
│   ├── product-grid-section.tsx
│   └── ...
├── commerce/
│   ├── cart-provider.tsx
│   ├── cart-drawer.tsx
│   ├── checkout-dialog.tsx
│   ├── product-card/
│   └── variant-selector.tsx
├── editor/
│   ├── storefront-editor.tsx
│   ├── settings-sidebar.tsx
│   ├── preview-frame.tsx
│   ├── editor-toolbar.tsx
│   └── panels/
└── api/
    ├── storefront-api.ts
    └── storefront-query.ts
```

### Template registry

Mỗi template khai báo:

- ID và version.
- Metadata hiển thị trong gallery.
- Preview asset.
- Default config.
- Font set.
- Supported section types.
- Supported variants cho header/product card/footer.
- Renderer component.
- Config constraints.

Không dùng `switch (template)` trong component 1.000 dòng.

### Theme runtime

Sinh CSS variables ở wrapper:

```css
--sf-color-primary
--sf-color-accent
--sf-color-background
--sf-color-surface
--sf-color-text
--sf-color-muted
--sf-font-heading
--sf-font-body
--sf-radius-control
--sf-radius-card
--sf-space-section
```

Component chỉ dùng semantic token. Không hard-code `text-pos-blue-*` trong storefront tenant.

### Shared commerce, distinct presentation

Logic cart, checkout, price, stock và variant là shared.

Template được phép cung cấp presentation adapter cho:

- Header.
- Hero.
- Product card.
- Category navigation.
- Footer.

Cách này giữ trải nghiệm khác biệt mà không nhân bản business logic.

## 10. Thiết kế editor admin

### Form architecture

- Dùng `react-hook-form` + Zod resolver.
- Một form state duy nhất cho toàn config.
- Field array cho section/menu/policy link.
- Debounce preview update khoảng 150-250 ms.
- Save draft là mutation riêng, không publish tự động.
- Dirty checking dựa trên form state/revision.

### Live preview

Khuyến nghị dùng iframe cùng origin:

- Preview đúng CSS/runtime của storefront public.
- Tách style dashboard khỏi style storefront.
- Gửi draft config qua `postMessage` với origin check.
- Preview dùng sample data khi store chưa đủ ảnh/sản phẩm.
- Có device presets: 390 px, 768 px, full desktop.
- Có refresh và "Open preview in new tab".

Preview route:

- `/dashboard/storefront/preview` cho iframe.
- Hoặc `/sites/[subdomain]/preview?token=...` với signed short-lived token nếu cần server render.

Không truyền toàn bộ config nhạy cảm qua query string.

### Template gallery

- Preview phải là screenshot thật của template, không dùng ảnh stock chung chung.
- Mỗi item hiển thị ngành hàng phù hợp, density và feature chính.
- Click mở preview lớn; nút "Áp dụng mẫu" là command rõ ràng.
- Khi đổi template, hiển thị diff: phần nào được giữ, phần nào reset.
- Cho phép "Giữ nội dung, đổi style" nếu schema section tương thích.

### Asset picker

Tái sử dụng `ImageUpload` và Asset API hiện có:

- Upload logo, favicon, hero và OG image.
- Hiển thị crop ratio theo slot.
- Validate MIME, dung lượng và kích thước tối thiểu.
- Có alt text.
- Không yêu cầu admin dán URL ở flow chính.
- URL chỉ nằm trong phần nâng cao/migration fallback.

### Publish workflow

1. Admin chỉnh draft và xem preview.
2. Save draft tự động hoặc chủ động.
3. Chạy pre-publish validation.
4. Hiển thị lỗi theo panel và link tới field.
5. Publish tạo revision immutable.
6. Public cache được invalidate theo store/subdomain.
7. Có nút rollback về revision đã publish trước.

Pre-publish validation tối thiểu:

- Subdomain hợp lệ.
- Logo/brand name tồn tại.
- Màu đạt contrast ở CTA chính.
- Hero có asset/alt nếu section được bật.
- Navigation không có link hỏng rõ ràng.
- Có ít nhất một sản phẩm active.
- Checkout có ít nhất một fulfillment/payment method.
- URL social/SEO hợp lệ.

## 11. API đề xuất

### Admin

- `GET /storefronts/:storeId`
  - Trả metadata, draft config, published revision và validation status.
- `PUT /storefronts/:storeId/draft`
  - Validate và lưu draft.
- `POST /storefronts/:storeId/publish`
  - Publish revision hiện tại.
- `GET /storefronts/:storeId/revisions`
  - Danh sách revision.
- `POST /storefronts/:storeId/revisions/:revisionId/restore`
  - Copy revision cũ thành draft mới.
- `POST /storefronts/:storeId/validate`
  - Chạy pre-publish validation.
- `GET /storefronts/templates`
  - Metadata template/feature hỗ trợ.

Mọi endpoint admin phải kiểm tra owner/store membership theo policy hiện có.

### Public

- `GET /public/storefronts/:subdomain`
  - Trả published config đã sanitize và store summary.
- `GET /public/storefronts/:subdomain/products`
  - Search, category, sort, cursor/page.
- `GET /public/storefronts/:subdomain/products/:productId`
  - Product, variant, stock snapshot và related products.
- `POST /public/storefronts/:subdomain/orders`
  - Tạo đơn hàng thật.

Public response không trả draft, internal IDs không cần thiết hoặc toàn bộ thông tin thanh toán trước khi có order.

### Cache

- Cache published storefront config theo subdomain/revision.
- Cache catalog query ngắn hạn theo store/filter.
- Invalidate khi publish, product/category đổi trạng thái hoặc giá/tồn kho đổi.
- Không cache checkout/order mutation.

## 12. Search, catalog và pagination

Search hiện tại lọc client-side trên trang sản phẩm đầu tiên, vì vậy kết quả không đầy đủ.

Storefront v2:

- Search/filter/sort gọi API server-side.
- URL đồng bộ query: `?q=&category=&sort=&page=`.
- Debounce search.
- Có pagination hoặc "Xem thêm"; ưu tiên pagination ở phase đầu vì dễ SEO và kiểm thử.
- Server chỉ trả product active, không deleted, thuộc category public.
- Giá hiển thị dựa trên variant hợp lệ; hỗ trợ "Từ X" nếu nhiều giá.
- Tồn kho được xác minh lại khi tạo order.

## 13. Responsive và accessibility

### Breakpoint cần kiểm thử

- 360 x 800.
- 390 x 844.
- 768 x 1024.
- 1024 x 768.
- 1366 x 768.
- 1440 x 900.

### Tiêu chí

- Không có horizontal overflow ngoài carousel chủ đích.
- Sticky header không che anchor/heading.
- Text dài tiếng Việt không tràn button/card.
- Touch target tối thiểu khoảng 44 x 44 px cho hành động chính trên mobile.
- Keyboard sử dụng được navigation, filter, product option, cart, modal và section sorter.
- Focus visible rõ.
- Dialog trap focus và trả focus đúng khi đóng.
- Tất cả icon button có accessible name/tooltip khi cần.
- Ảnh có `alt` phù hợp; ảnh trang trí dùng alt rỗng.
- Form checkout có label, error message và summary lỗi.
- Contrast đạt WCAG AA cho text/control chính.
- Tôn trọng `prefers-reduced-motion`.

## 14. Performance và SEO budget

### Performance

- Dùng `next/image` hoặc image loader phù hợp cho product/brand asset.
- Không phụ thuộc ảnh Unsplash runtime trong production.
- Hero có kích thước ổn định để tránh layout shift.
- Lazy-load section dưới fold và cart/checkout code nếu hợp lý.
- Chỉ tải font của template đang active.
- Giữ client component nhỏ; fetch/render dữ liệu tĩnh bằng server component khi có thể.
- Không gửi draft/editor code vào public storefront bundle.

Budget mục tiêu:

- LCP mobile p75 dưới 2,5 giây trong điều kiện production hợp lý.
- CLS dưới 0,1.
- INP dưới 200 ms.
- Lighthouse Accessibility và SEO từ 90 trở lên trên template mẫu.

### SEO

- Metadata dựa trên published config.
- Canonical theo subdomain thực tế.
- Product/category page có title/description riêng.
- Structured data không chứa dữ liệu giả.
- Private/unpublished/preview luôn `noindex`.

## 15. Analytics và quan sát lỗi

Phase đầu chỉ cần event nội bộ có abstraction:

- `storefront_viewed`.
- `search_submitted`.
- `category_selected`.
- `product_viewed`.
- `add_to_cart`.
- `checkout_started`.
- `order_created`.
- `checkout_failed`.

Event không chứa dữ liệu cá nhân nhạy cảm. Log server cần có:

- Store ID.
- Published revision ID.
- Request/correlation ID.
- Error code.
- Không log đầy đủ số điện thoại/địa chỉ/thông tin ngân hàng.

## 16. Testing strategy

### Unit test

- Config defaults.
- Config migration v1 -> v2.
- Template registry/constraint.
- Theme token generation và contrast guard.
- Price/variant/stock helpers.
- Cart reducer.
- Publish validation.

### API integration test

- Owner/member authorization.
- Save draft không ảnh hưởng published storefront.
- Publish tạo revision đúng.
- Restore tạo draft mới.
- Public API chỉ trả published config.
- Unpublished store trả 404.
- Search/filter/pagination đúng tenant.
- Public order không tin giá từ client.
- Order transaction rollback khi variant/stock không hợp lệ.

### Component test

- Editor dirty/saved states.
- Template switch confirmation.
- Section reorder.
- Asset upload.
- Device preview switch.
- Variant selection.
- Cart quantity.
- Checkout validation.

### E2E

1. Admin tạo storefront từ default.
2. Upload logo/hero.
3. Chọn template và chỉnh brand.
4. Chọn category/featured products.
5. Preview mobile/desktop.
6. Publish.
7. Khách mở subdomain.
8. Search và chọn variant.
9. Thêm giỏ, checkout và tạo order thật.
10. Admin thấy order trong dashboard.
11. Admin chỉnh draft nhưng public vẫn giữ bản cũ.
12. Admin publish revision mới rồi rollback.

### Visual regression

- Screenshot ba template ở sáu viewport.
- State: default, dữ liệu dài, thiếu ảnh, hết hàng, cart mở, checkout mở, empty search.
- So sánh pixel/snapshot có threshold hợp lý.
- Kiểm tra canvas/image không blank và asset không lỗi.

## 17. Migration

### Mapping config v1

| V1                        | V2                        |
| ------------------------- | ------------------------- |
| `enabled`                 | `Storefront.enabled`      |
| `template_id: classic`    | `template.id: market`     |
| `template_id: ecommerce`  | `template.id: editorial`  |
| `template_id: restaurant` | legacy adapter            |
| `primary_color`           | `brand.primary_color`     |
| `logo_url`                | `brand.logo_url` fallback |
| `banner_url`              | `brand.hero_url` fallback |
| `facebook_url`            | `social.facebook_url`     |
| `tiktok_url`              | `social.tiktok_url`       |

### Quy trình

1. Thêm schema/table mới, chưa đổi public runtime.
2. Viết migration function idempotent.
3. Backfill storefront/revision cho store có config cũ.
4. Dual-read: ưu tiên v2, fallback v1.
5. Chuyển configurator sang v2.
6. Chuyển public renderer sang v2 theo feature flag.
7. Theo dõi lỗi và rollback được.
8. Ngừng ghi v1.
9. Xóa fallback sau một chu kỳ release ổn định.

Không xóa `retail_config` trong cùng release với migration đầu tiên.

## 18. Lộ trình triển khai

### Phase 0 - Product/design foundation

- [ ] Chốt ba segment retail và xử lý template restaurant.
- [ ] Chốt feature matrix từng template.
- [ ] Tạo wireframe desktop/mobile cho admin editor.
- [ ] Tạo high-fidelity design cho ba template bằng cùng một bộ dữ liệu mẫu.
- [ ] Chốt font/palette/image guideline.
- [ ] Tạo screenshot thật cho template gallery.
- [ ] Chốt contract `StorefrontConfigV2`.

Deliverable:

- Design spec, tokens, config schema và acceptance criteria đã duyệt.

### Phase 1 - Domain model và publish lifecycle

- [ ] Thêm `Storefront` và `StorefrontRevision`.
- [ ] Tạo schema/default/migration v2.
- [ ] Thêm admin draft/publish/restore API.
- [ ] Thêm public published config API.
- [ ] Viết authorization và integration test.
- [ ] Backfill config cũ.

Deliverable:

- Có thể lưu draft, publish và đọc đúng published revision mà chưa cần UI mới.

### Phase 2 - Runtime và shared commerce

- [ ] Tách type/schema/default/registry khỏi component cũ.
- [ ] Xây theme token runtime.
- [ ] Xây section renderer.
- [ ] Tách cart provider, variant selector, cart drawer và checkout.
- [ ] Xây catalog/product API có search/filter/pagination.
- [ ] Xây public order endpoint và nối với Order hiện có.
- [ ] Thêm product detail route.

Deliverable:

- Runtime mới hoạt động với template kỹ thuật tối thiểu và order thật.

### Phase 3 - Admin configurator

- [ ] Xây shell editor, sidebar và toolbar.
- [ ] Chuyển form sang React Hook Form + Zod.
- [ ] Xây live preview iframe.
- [ ] Tích hợp Asset picker/upload.
- [ ] Xây panel tổng quan/template/brand/home/catalog/header/checkout/footer/SEO.
- [ ] Thêm dirty state, autosave/save draft, publish validation và rollback.
- [ ] Responsive editor.

Deliverable:

- Admin cấu hình end-to-end không cần nhập URL ảnh thủ công.

### Phase 4 - Ba template production

- [ ] Implement `market`.
- [ ] Implement `editorial`.
- [ ] Implement `specialist`.
- [ ] Xây template-specific product card/header/footer.
- [ ] Hoàn thiện empty/loading/error states.
- [ ] Hoàn thiện motion và reduced motion.
- [ ] Visual regression toàn bộ template.

Deliverable:

- Ba template có chất riêng, cùng dùng runtime/commerce contract.

### Phase 5 - Hardening và rollout

- [ ] Accessibility audit.
- [ ] Performance profiling và image/font optimization.
- [ ] SEO/structured data/sitemap.
- [ ] Cache và invalidation.
- [ ] Analytics/error tracking.
- [ ] Feature flag theo store.
- [ ] Pilot với 3-5 cửa hàng có ngành hàng khác nhau.
- [ ] Sửa lỗi theo dữ liệu thật.
- [ ] Rollout dần và theo dõi conversion/error.

Deliverable:

- Storefront v2 sẵn sàng bật mặc định cho retail tenant.

## 19. Cách chia PR/commit

Mỗi hạng mục dưới đây nên là PR độc lập, có thể review và rollback:

1. Thêm config v2 schema, defaults và migration tests.
2. Thêm Prisma models/migration.
3. Thêm admin storefront draft/publish API.
4. Thêm public storefront v2 API.
5. Thêm catalog search/filter/product detail API.
6. Thêm public order creation API.
7. Thêm storefront registry/theme runtime.
8. Tách shared commerce từ component cũ.
9. Thêm editor shell/live preview.
10. Thêm asset picker và brand settings.
11. Thêm section editor.
12. Implement template `market`.
13. Implement template `editorial`.
14. Implement template `specialist`.
15. SEO/performance/accessibility hardening.
16. Migration, feature flag và rollout.

Không gộp migration database, ba template và editor vào một PR lớn.

## 20. Definition of Done

Một storefront template được coi là hoàn thành khi:

- Có art direction và component variant riêng, không chỉ đổi màu/grid.
- Admin cấu hình được bằng UI và thấy live preview.
- Config có schema/default/migration/test.
- Desktop/mobile không overflow hoặc overlap.
- Sản phẩm dài tên, thiếu ảnh, hết hàng và nhiều variant đều hiển thị đúng.
- Search/filter hoạt động trên toàn catalog public.
- Checkout tạo Order thật ở server.
- Draft không làm thay đổi public site trước khi publish.
- Public response không lộ draft/config nhạy cảm.
- Accessibility keyboard/focus/contrast đạt tiêu chí.
- Visual regression đủ state và viewport.
- Type-check, lint, test, build đều qua trong phạm vi thay đổi.
- Có rollback revision và feature flag khi release.

## 21. Decision gates cần chốt trước khi code UI

1. `restaurant` tiếp tục là legacy hay chuyển hẳn sang domain restaurant?
2. Phase đầu có cần local delivery hay chỉ pickup/COD?
3. Có cho admin ẩn "Powered by NexPOS" hay phụ thuộc gói?
4. Có cần product detail ngay v2 hay quick view đủ cho release đầu?
5. Revision history giữ bao nhiêu bản?
6. Autosave mặc định hay chỉ save draft thủ công?
7. Có cần custom domain trong roadmap gần để chuẩn hóa canonical/certificate từ đầu?

Khuyến nghị mặc định:

- Giữ `restaurant` legacy.
- Hỗ trợ pickup + local delivery đơn giản.
- Luôn hiện "Powered by NexPOS" ở v2 đầu.
- Có product detail route.
- Giữ 20 revision gần nhất.
- Autosave draft có debounce, publish luôn là thao tác chủ động.
- Thiết kế URL resolver để thêm custom domain sau, chưa triển khai certificate/domain verification.

## 22. Thứ tự ưu tiên khi cần thu hẹp scope

### P0

- Config v2 + migration.
- Draft/publish.
- Live preview.
- Brand + template + catalog + checkout config cơ bản.
- Template `market` và `editorial`.
- Search/filter server-side.
- Chọn variant và tạo order thật.
- Responsive/accessibility/performance cơ bản.

### P1

- Template `specialist`.
- Section reorder.
- Product detail đầy đủ.
- Revision history/rollback UI.
- SEO nâng cao và structured data.
- Analytics funnel.

### P2

- Nhiều header/footer variant.
- Newsletter.
- Custom domain.
- Custom analytics provider.
- Custom CSS có sandbox.
- Theme marketplace.

P0 phải tạo được một luồng bán hàng hoàn chỉnh; không nên đổi toàn bộ hình ảnh trước nhưng vẫn giữ checkout giả.
