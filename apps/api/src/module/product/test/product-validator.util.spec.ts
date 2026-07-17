import { BadRequestError } from 'app/common/response';
import { ProductValidatorUtil } from '../utils/product-validator.util';

describe('ProductValidatorUtil', () => {
  it('throws when product is missing', async () => {
    const repository = {
      findActiveById: jest.fn().mockResolvedValue(null),
    };
    const util = new ProductValidatorUtil(repository as never);

    await expect(
      util.ensureProductExists('product-1', 'store-1'),
    ).rejects.toThrow(BadRequestError);
  });

  it('throws when sku is already used', async () => {
    const repository = {
      findBySku: jest.fn().mockResolvedValue({ id: 'product-1' }),
    };
    const util = new ProductValidatorUtil(repository as never);

    await expect(util.ensureSkuAvailable('SKU-1', 'store-1')).rejects.toThrow(
      BadRequestError,
    );
  });

  it('throws when barcode is already used', async () => {
    const repository = {
      findVariantByBarcode: jest.fn().mockResolvedValue({ id: 'variant-1' }),
    };
    const util = new ProductValidatorUtil(repository as never);

    await expect(
      util.ensureBarcodeAvailable('BAR-1', 'store-1'),
    ).rejects.toThrow(BadRequestError);
  });
});
