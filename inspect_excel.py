import pandas as pd
import os

file_path = r'C:\Users\TI04\Documents\Antigravity\Agente\longway\long-way-alimentos\base\Relatório de peso Horizontal - RQ.xlsx'

try:
    xl = pd.ExcelFile(file_path)
    sheet_name = next((n for n in xl.sheet_names if 'Avalia' in n), None)
    if sheet_name:
        # Read as is, without header
        df = pd.read_excel(file_path, sheet_name=sheet_name, header=None)
        
        print(f"---FULL DUMP OF {sheet_name} (NON-EMPTY CELLS)---")
        for r_idx, row in df.iterrows():
            for c_idx, val in enumerate(row):
                if pd.notna(val):
                    print(f"R{r_idx:3} C{c_idx:2} | Type: {type(val).__name__:10} | Value: {val}")
    else:
        print("Avaliação sheet not found")

except Exception as e:
    print(f"Error: {e}")
