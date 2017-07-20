import arcpy

roads = "/data/sjc_roads.shp"
raw_vertexes = "/graph/raw_vertexes.shp"
raw_vertexes_layer = "raw_vertexes_layer"
vertexes = "/graph/vertexes.shp"

# Gera pontos em ambas as extremidades dos polígonos (inicio e fim).
# Neste processo muitos pontos estarão sobrepostos por conta das
# conexões entre as polilinhas.
arcpy.FeatureVerticesToPoints_management(roads, raw_vertexes, "BOTH_ENDS")

# Cria um apelido (alias) temporário para os pontos de extremidades
# gerados no processo anterior.
arcpy.MakeFeatureLayer_management(raw_vertexes, raw_vertexes_layer)

# Executa um procedimento para unificar os pontos sobrepostos por meio
# de uma comparação espacial entre eles.
# Este procedimento verifica se as geometrias sobrepostas são exatamente
# iguals, e caso sejam transforma somente em uma geometria
arcpy.Dissolve_management(raw_vertexes_layer, vertexes)

# Adiciona um campo nos pontos unificados para a definição da nomenclatura
# entre eles
arcpy.AddField_management(vertexes, "Name", "TEXT")

# Processa todos os registros de pontos unificados e atribui um identificador
# (nome) único para cada um deles, compost pelo texto "point" concatenado ao ID
arcpy.CalculateField_management(vertexes, "Name", 'point!OBJECTID!', "PYTHON")
