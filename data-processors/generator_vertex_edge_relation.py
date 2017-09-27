import arcpy
import json

arcpy.env.workspace = 'c:/tcc/data/graph.gdb'
arcpy.env.overwriteOutput = True

arcpy.MakeFeatureLayer_management('vertex', 'vertex_lyr')
arcpy.MakeFeatureLayer_management('edge', 'edge_lyr')

def get_edges(vertex):
    arcpy.SelectLayerByLocation_management('edge_lyr', 'INTERSECT', [vertex], selection_type='NEW_SELECTION')

    features = arcpy.SearchCursor('edge_lyr')

    return [(item.getValue('OBJECTID'), item.getValue('SHAPE'), item.getValue('ONEWAY'), item.getValue('ST_ID')) for item in features]

vertexes = arcpy.SearchCursor('vertex')

relation = {}

c = 0
for vertex in vertexes:

    vertex_geometry = vertex.getValue('SHAPE')
    vertex_oid = vertex.getValue('OBJECTID')
    vertex_name = vertex.getValue('Name')

    print ' -------------------------'
    print 'Feature: ', vertex_name

    edges = get_edges(vertex_geometry)
    print '> Edge Count: ', str(len(edges))

    relation[vertex_name] = []

    for edge in edges:

        edge_oid, edge_geometry, edge_way, edge_st_id = edge

        print '> Edge: {0} | Way: {1}'.format(edge_oid, edge_way)

        relation[vertex_name].append(edge_st_id)

with open('vertex_edge_relation.txt', 'w') as outfile:
    json.dump(relation, outfile)
