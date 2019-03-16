import json
import csv

f = open('nodes.json', 'r')
f1 = open('link.csv', 'r')
data_link = csv.reader(f1)
data = json.load(f)

loc_dict = {}
for d in data:
    loc_dict[d['id']] = [d['x'], d['y']]

out_arr = []
index = 0
for row in data_link:
    if index > 0:
        tmp_dict = dict()
        tmp_dict['loc'] = [loc_dict[row[0]], loc_dict[row[1]]]
        tmp_dict['source'] = row[0]
        tmp_dict['target'] = row[1]
        out_arr.append(tmp_dict)
    index += 1

of = open('../links.json', 'w')
out_data = json.dumps(out_arr)
of.write(out_data)
of.close()