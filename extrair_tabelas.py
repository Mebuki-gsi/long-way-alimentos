import pandas as pd
import os

base_dir = r"c:\Users\TI04\Documents\Antigravity\Agente\longway\long-way-alimentos\base"
files = [
    "Relatório de peso Horizontal - GS.xlsx",
    "Relatório de peso Horizontal - RQ.xlsx",
    "Relatório de peso Vertical - HS.xlsx"
]

output_md = r"c:\Users\TI04\Documents\Antigravity\Agente\longway\long-way-alimentos\dados_planilhas.md"

with open(output_md, "w", encoding="utf-8") as f:
    f.write("# Dados das Planilhas (Aba Tabela)\n\n")
    
    for file in files:
        path = os.path.join(base_dir, file)
        f.write(f"## Planilha: {file}\n\n")
        
        if not os.path.exists(path):
            f.write(f"**Arquivo não encontrado:** {file}\n\n")
            continue
            
        try:
            # Lendo a aba "Tabelas"
            df = pd.read_excel(path, sheet_name="Tabelas")
            
            # Checando o tamanho da tabela
            total_rows = len(df)
            f.write(f"*Total de linhas na aba 'Tabelas': {total_rows}*\n\n")
            
            if total_rows > 100:
                f.write("*Nota: Para evitar um arquivo Markdown muito grande, apenas as primeiras 100 linhas estão sendo exibidas.*\n\n")
                df_to_show = df.head(100)
            else:
                df_to_show = df
                
            # Convertendo para markdown
            md_table = df_to_show.to_markdown(index=False)
            f.write(md_table)
            f.write("\n\n---\n\n")
            print(f"Sucesso: {file} processado com {total_rows} linhas.")
            
        except Exception as e:
            f.write(f"**Erro ao ler a planilha {file}:** `{str(e)}`\n\n")
            print(f"Erro em {file}: {e}")

print("Arquivo Markdown gerado com sucesso!")
