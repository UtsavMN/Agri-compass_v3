import Papa from 'papaparse';

let cachedDistrictDataPromise: Promise<any[]> | null = null;

export const loadDistrictDataFromCSV = (): Promise<any[]> => {
  if (cachedDistrictDataPromise) {
    return cachedDistrictDataPromise;
  }

  cachedDistrictDataPromise = new Promise(async (resolve) => {
    try {
      const response = await fetch('/districts.csv');
      const csvText = await response.text();
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data as any[]);
        },
        error: (error: any) => {
          console.error('Error parsing CSV:', error);
          resolve([]);
        }
      });
    } catch (error) {
      console.error('Error loading district data:', error);
      resolve([]);
    }
  });

  return cachedDistrictDataPromise;
};
