import os
import pandas as pd
import numpy as np

csv_path = r"C:\Users\surya\Downloads\6c05cd1b-ed59-40c2-bc31-e314f39c6971_a065b41335bbc0c49eba94aeaaa338ab.csv"

def run_audit():
    # 1. Filename & Size
    filename = os.path.basename(csv_path)
    file_size_bytes = os.path.getsize(csv_path)
    print(f"Filename: {filename}")
    print(f"File size: {file_size_bytes} bytes ({file_size_bytes / 1024:.2f} KB)")
    
    # Read CSV
    df = pd.read_csv(csv_path)
    
    # 2. Columns
    columns = list(df.columns)
    print(f"Columns: {columns}")
    
    # 3. Total Rows
    total_rows = len(df)
    print(f"Total rows: {total_rows}")
    
    # 4. Unique Rows and Duplicate Rows
    # Determine exact duplicates across all columns
    duplicate_mask = df.duplicated(keep=False)
    exact_duplicates_count = df.duplicated().sum()
    unique_rows_count = total_rows - exact_duplicates_count
    print(f"Unique rows (deduplicated count): {len(df.drop_duplicates())}")
    print(f"Total exact duplicate rows (non-first occurrences): {exact_duplicates_count}")
    print(f"Is exact duplication happening? {df.duplicated().any()}")
    
    # 5. Districts
    districts = list(df['District'].unique())
    print(f"Districts ({len(districts)}): {districts}")
    
    # 6. Visakhapatanam row count
    vizag_df = df[df['District'] == 'Visakhapatanam']
    vizag_rows = len(vizag_df)
    vizag_unique_rows = len(vizag_df.drop_duplicates())
    vizag_exact_duplicates = vizag_df.duplicated().sum()
    print(f"Visakhapatanam row count: {vizag_rows}")
    print(f"Unique Visakhapatanam row count: {vizag_unique_rows}")
    print(f"Visakhapatanam duplicate rows: {vizag_exact_duplicates}")
    
    # 7. Dates (earliest/latest, validation)
    # Parse dates
    # Try multiple formats, usually DD-MM-YYYY or YYYY-MM-DD
    # Let's inspect unique date strings first or parse them
    date_series = pd.to_datetime(df['Date'], errors='coerce')
    invalid_dates_count = date_series.isna().sum()
    
    earliest_date = date_series.min()
    latest_date = date_series.max()
    print(f"Earliest date: {earliest_date}")
    print(f"Latest date: {latest_date}")
    print(f"Invalid dates count: {invalid_dates_count}")
    
    # 8. Rainfall stats (min, max, average, invalid, missing)
    rainfall = df['Avg_rainfall']
    min_rain = rainfall.min()
    max_rain = rainfall.max()
    avg_rain = rainfall.mean()
    missing_rain = rainfall.isna().sum()
    # Check invalid rainfall values (e.g. negative values or non-numeric if float parsing worked)
    invalid_rain = (rainfall < 0).sum()
    
    print(f"Rainfall Minimum: {min_rain}")
    print(f"Rainfall Maximum: {max_rain}")
    print(f"Rainfall Average: {avg_rain:.6f}")
    print(f"Missing rainfall values: {missing_rain}")
    print(f"Invalid (negative) rainfall values: {invalid_rain}")
    
    # 9. Missing values overall
    missing_values_per_col = df.isna().sum().to_dict()
    print(f"Missing values per column: {missing_values_per_col}")
    
    # 10. Agency values
    agencies = list(df['Agency_name'].unique())
    print(f"Agency values: {agencies}")

if __name__ == "__main__":
    run_audit()
