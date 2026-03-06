
import { useMemo } from 'react';

export interface Company {
  id: number;
  name: string;
  logo_url?: string;
}

export interface CompanyOptionData {
  value: string;
  label: string;
  isAllOption?: boolean;
}

/**
 * Hook to generate company option data for Combobox component
 * @param companies - Array of companies
 * @param includeAllOption - Whether to include "All companies" option
 * @returns Array of CompanyOptionData (without icons - add icons in component)
 */
export function useCompanyOptions(companies: Company[], includeAllOption = true): CompanyOptionData[] {
  return useMemo(() => {
    const opts: CompanyOptionData[] = [];
    
    if (includeAllOption) {
      opts.push({
        value: "",
        label: "All companies",
        isAllOption: true
      });
    }
    
    if (companies && companies.length > 0) {
      companies.forEach(company => {
        opts.push({
          value: company.id.toString(),
          label: company.name,
          isAllOption: false
        });
      });
    }
    
    return opts;
  }, [companies, includeAllOption]);
}
