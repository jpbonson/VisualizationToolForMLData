# VisualizationToolForMLData
Visualization tool using Python and Javascript for real-valued classification data for Machine Learning problems.

python "C:\Users\jpbonson\Dropbox\Dalhousie Winter 2015\Visualization\project\VisualizationToolForMLData\run.py"
http://127.0.0.1:5000/

# TODO (Optional):
# - escrever o report

# FUTURE:
# - zoom funcionar com scroll wheel
# - option to choose the size of the scatter matrix, so it can be better visualized for datasets with lots of features
# - filtering feature for classes, so the data for some classes could be hidden to remove noise
# - updated the histograms to use stacked bars, so each bar will have the quantity per range and per class
# - fazer star plot funcionar para dados com valores negativos
# - refatorar CSS para a scatter matrix
# - refatorar CSS do star plot para ir para o arquivo .css
# - atualizar README para usar o projeto de portfolio (colocar link do linkedln no pdf do projeto)

# DONE (Main):
# - implement zooming + UI adaptation
# - implement automatic filtering + UI adaptation
# - implement the star plot (+ selection especifica do star plot)
# - star plot working with filtering
# - star plot working with selection in the scatter matrix

# DONE (Optional):
# - fine-tune the histograms for greater zooms
# - dynamic histograms that change the quantity of bars depending on the zoom
# - foi tomado cuidado para que a interacao das features entre si nao gerassem bugs (por exemplo, zoom em (0,1) seguido da filtragem da linha 0)
# - option to upload .csv files with datasets to the system (or select the filename from a list in the folder)

# bugs corrigidos:
# - o eixo x estava invertido
# - instabilidade no schema de cores dos charts