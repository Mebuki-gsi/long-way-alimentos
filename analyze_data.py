import pandas as pd
import json
import os
import re

file_path = r'C:\Users\TI04\Documents\Antigravity\Agente\longway\long-way-alimentos\base\Relatório de peso Horizontal - RQ.xlsx'

def analyze_excel():
    xl = pd.ExcelFile(file_path)
    
    # Check for 'base' sheet
    base_sheet = next((n for n in xl.sheet_names if n.lower() == 'base'), None)
    if not base_sheet:
        print("Sheet 'base' not found")
        return

    # Read base sheet (header is 0, but content is strings)
    df = pd.read_excel(file_path, sheet_name=base_sheet)
    
    # Detect the column that looks like CSV data
    # Usually it's the first column
    target_col = df.columns[0]
    raw_rows = df[target_col].dropna().astype(str).tolist()
    
    print(f"Processing {len(raw_rows)} rows from sheet: {base_sheet}")
    
    weights = []
    for row_str in raw_rows:
        # Format: 2025/11/27,"23:43:08","1","240.2000","Não"
        # We want the 3rd index (4th element) which is weight
        # Use regex to handle quotes and commas
        parts = re.findall(r'"([^"]*)"|([^,]+)', row_str)
        parts = [p[0] if p[0] else p[1] for p in parts]
        
        if len(parts) >= 4:
            try:
                w = float(parts[3])
                weights.append(w)
            except ValueError:
                continue
                
    if not weights:
        print("No weights extracted from CSV strings")
        return

    print(f"Extracted {len(weights)} weight records.")
    
    # Calculate basic stats
    stats = {
        "count": len(weights),
        "mean": sum(weights) / len(weights) if weights else 0,
        "std": pd.Series(weights).std() if len(weights) > 1 else 0,
        "min": min(weights) if weights else 0,
        "max": max(weights) if weights else 0,
        "median": pd.Series(weights).median() if weights else 0,
        "q1": pd.Series(weights).quantile(0.25) if weights else 0,
        "q3": pd.Series(weights).quantile(0.75) if weights else 0,
    }
    
    # Rejection logic (standard is 202g)
    standard = 202
    rejections = [w for w in weights if w < standard]
    stats["rejection_count"] = len(rejections)
    stats["rejection_rate"] = (len(rejections) / len(weights) * 100) if weights else 0
    stats["conformity_count"] = len(weights) - len(rejections)
    stats["conformity_rate"] = (stats["conformity_count"] / len(weights) * 100) if weights else 0
    
    # CV
    stats["cv"] = (stats["std"] / stats["mean"] * 100) if stats["mean"] else 0
    stats["range"] = stats["max"] - stats["min"]
    
    # Time series (last 100)
    time_series = [{"x": i+1, "y": float(w)} for i, w in enumerate(weights[-100:])]
    
    # Distribution
    bins = [0, 190, 200, 210, 220, 230, 240, 250, float('inf')]
    labels = ['<190g', '190-200g', '200-210g', '210-220g', '220-230g', '230-240g', '240-250g', '250+g']
    dist = pd.cut(weights, bins=bins, labels=labels).value_counts().sort_index().to_dict()
    distribution = [{"label": str(k), "value": int(v)} for k, v in dist.items() if k != '<190g' or v > 0]
    
    result = {
        "stats": stats,
        "timeSeries": time_series,
        "distribution": distribution
    }
    
    with open('dashboard_data.json', 'w') as f:
        json.dump(result, f, indent=4)
    
    print("Data processed and saved to dashboard_data.json")

if __name__ == "__main__":
    analyze_excel()
