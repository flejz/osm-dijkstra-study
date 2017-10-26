import arcpy
import json

arcpy.env.workspace = 'c:/tcc/data/graph.gdb'
arcpy.env.overwriteOutput = True

arcpy.MakeFeatureLayer_management('vertex', 'vertex_lyr')
arcpy.MakeFeatureLayer_management('edge', 'edge_lyr')

def get_edges(vertex):

    # Seleciona todoos as arestas que fazem interseccão
    # com o vértice informado
    arcpy.SelectLayerByLocation_management(
        'edge_lyr',
        'INTERSECT',
        [vertex],
        selection_type='NEW_SELECTION')

    features = arcpy.SearchCursor('edge_lyr')

    # Retorna a lista de arestas
    return [(
        item.getValue('OBJECTID'),
        item.getValue('SHAPE'),
        item.getValue('ONEWAY'),
        item.getValue('Shape_Length'),
        item.getValue('AVG_SPEED'))
        for item in features]

def get_vertex(edge, vertex):

    # Seleciona todos os vértices que fazem intersecção
    # com a aresta informada
    arcpy.SelectLayerByLocation_management(
        'vertex_lyr',
        'INTERSECT',
        [edge],
        selection_type='NEW_SELECTION')

    # Remove da seleção um dos vértices utilizando uma
    # seleção por atributo
    arcpy.SelectLayerByAttribute_management(
        'vertex_lyr',
        'REMOVE_FROM_SELECTION',
        '"OBJECTID" = {0}'.format(vertex))

    features = arcpy.SearchCursor('vertex_lyr')

    # Retorna a lista de vértices
    return [(
        item.getValue('OBJECTID'),
        item.getValue('SHAPE'),
        item.getValue('Name'))
        for item in features]

def can_go_this_way(edge_geometry, edge_way, vertex_geometry):

    # Caso o valor da mão de direção seja B, significa que
    # a via é de mão dupla (B = both)
    if edge_way == 'B':
        return True

    # Caso não seja de mão dupla, uma análise para identificar
    # qual a direção da via é necessária

    # Pega os pontos de início e fim da aresta
    edge_first_point = edge_geometry.firstPoint
    edge_last_point = edge_geometry.lastPoint

    # Verifica se o vértice de origem é igual a origem da aresta,
    # e se a aresta tem a direção FT (From > To), o que significa
    # que a mão dela é do primeiro para o último ponto, conforme
    # o sentido de construção da geometria da aresta
    if edge_first_point.equals(vertex_geometry) and edge_way == 'FT':
        return True

    # Verifica se o vértice de origem é igual ao destino da aresta,
    # e se a aresta tem a direção TF (To > From), o que significa
    # que a mão dela é do último para o primeiro ponto, conforme
    # o sentido de construção da geometria da aresta
    elif edge_last_point.equals(vertex_geometry) and edge_way == 'TF':
        return True

    return False


vertexes = arcpy.SearchCursor('vertex')

graph_by_distance = {}
graph_by_time = {}

for vertex in vertexes:

    vertex_geometry = vertex.getValue('SHAPE')
    vertex_oid = vertex.getValue('OBJECTID')
    vertex_name = vertex.getValue('Name')

    print ' -------------------------'
    print 'Feature: ', vertex_name

    edges = get_edges(vertex_geometry)
    print '> Edge Count: ', str(len(edges))

    graph_by_distance[vertex_name] = {}
    graph_by_time[vertex_name] = {}

    for edge in edges:

        edge_oid, edge_geometry, edge_way, edge_length, edge_avg_speed = edge

        print '> Edge: {0} | Way: {1}'.format(edge_oid, edge_way)

        if not can_go_this_way(edge_geometry, edge_way, vertex_geometry):
            print '>> Can NOT go this way *********************'
            continue

        path_vertexes = get_vertex(edge_geometry, vertex_oid)

        print '>>> Vertex Count: ', str(len(path_vertexes))

        for path_vertex in path_vertexes:
            _, _, path_vertex_name = path_vertex
            print '>>> Vertex: ', path_vertex_name

            graph_by_distance[vertex_name][path_vertex_name] = edge_length
            graph_by_time[vertex_name][path_vertex_name] = edge_length / edge_avg_speed

# print graph_by_distance
# print graph_by_time

with open('graph_distance.txt', 'w') as outfile:
    json.dump(graph_by_distance, outfile)

with open('graph_time.txt', 'w') as outfile:
    json.dump(graph_by_time, outfile)
