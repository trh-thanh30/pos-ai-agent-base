import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { bank } from 'app/common/types/bank.type';

import type { ConfigType } from '@nestjs/config';
import { BusinessInfo } from 'app/common/types/business-info.type';
import { communesVN } from 'app/common/types/communes-vn.type';
import { provincesVN } from 'app/common/types/provinces-vn.type';
import { apiConfig } from 'app/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CommonService {
  private banksCache: bank[] | null = null;
  private lastFetchTime = 0;
  private CACHE_TTL = 1000 * 60 * 60; // 1 hour
  constructor(
    private readonly httpService: HttpService,
    @Inject(apiConfig.KEY)
    private readonly api_config: ConfigType<typeof apiConfig>,
  ) {}
  async getBanks(): Promise<bank[]> {
    const currentTime = Date.now();
    if (this.banksCache && currentTime - this.lastFetchTime < this.CACHE_TTL) {
      return this.banksCache;
    }
    const response = await firstValueFrom(
      this.httpService.get<any>(this.api_config.bank_vn),
    );
    const responseData = response.data;
    // VietQR wraps the list in a "data" property, while some other APIs return the list directly.
    this.banksCache = Array.isArray(responseData)
      ? responseData
      : responseData?.data || [];
    this.lastFetchTime = currentTime;
    return this.banksCache as bank[];
  }
  async geProvincesInVietNam() {
    const response = await firstValueFrom(
      this.httpService.get<provincesVN[]>(this.api_config.provinces_vn),
    );
    return response.data;
  }
  async getCommunesByProvinceIdInVietNam(provinceId: string) {
    const url = `${this.api_config.provinces_vn}/${provinceId}/communes`;

    const response = await firstValueFrom(
      this.httpService.get<communesVN[]>(url),
    );

    return response.data;
  }
  async getInfoBusinessByTaxCode(taxCode: string) {
    const url = `${this.api_config.tax_code_vn}/${taxCode}`;
    const response = await firstValueFrom(
      this.httpService.get<BusinessInfo[]>(url),
    );
    return response.data;
  }
}
