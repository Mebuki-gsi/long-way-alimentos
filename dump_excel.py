import pandas as pd

file_path = r'C:\Users\TI04\Documents\Antigravity\Agente\longway\long-way-alimentos\base\Relatório de peso Horizontal - RQ.xlsx'

def dump_raw():
    xl = pd.ExcelFile(file_path)
    sheet_name = next((n for n in xl.sheet_names if 'Avalia' in n), None)
    if not sheet_name:
        print("Sheet 'Avaliação' not found")
        return

    df = pd.read_excel(file_path, sheet_name=sheet_name, header=None)
    
    print(f"Sheet: {sheet_name}")
    print(f"Shape: {df.shape}")
    
    # Print first 20 rows of all columns
    print(df.head(20).to_string())
    
    # Also check if there's a 'base' sheet
    if 'base' in [n.lower() for n in xl.sheet_names]:
        print("\n--- BASE SHEET ---")
        base_df = pd.read_excel(file_path, sheet_name='base', header=0)
        print(base_df.head(20).to_string())
    else:
        print("\n'base' sheet not found")

if __name__ == "__main__":
    dump_raw()
