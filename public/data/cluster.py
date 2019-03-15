import numpy as np
from sklearn.cluster import DBSCAN
from sklearn import metrics
from sklearn.datasets.samples_generator import make_blobs
from sklearn.preprocessing import StandardScaler
import json

f = open('all_comb.json', 'r')
data = json.load(f)

for key in data.keys():
    comb_data = data[key]
    for cb in comb_data.keys():
        tmp_loc_arr = []
        tmp_id_arr = []
        for t in comb_data[cb]:
            tmp_loc_arr.append([float(t['x']), float(t['y'])])
            tmp_id_arr.append(t['id'])
        X = StandardScaler().fit_transform(tmp_loc_arr)
        db = DBSCAN(eps=0.1, min_samples=4).fit(X)
        labels = db.labels_
        new_arr = []
        for i in range(len(labels)):
            comb_data[cb][i]['cluster'] = str(labels[i])
# print(data)

of = open('cluster_all_comb.json', 'w')
out_data = json.dumps(data)
of.write(out_data)
of.close()
