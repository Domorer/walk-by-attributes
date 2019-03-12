import json

f_loc = open('A-T_p.txt', 'r')
f_id = open('A-T_id.txt', 'r')

id_arr = []
for line in f_id.readlines():
    tmp_id = line.strip()
    id_arr.append(tmp_id)

info_arr = []
index = 0
for line in f_loc.readlines():
    tmp_loc = line.strip().split(' ')
    tmp_dict = dict()
    tmp_dict['id'] = id_arr[index]
    tmp_dict['x'] = tmp_loc[0]
    tmp_dict['y'] = tmp_loc[1]
    info_arr.append(tmp_dict)
    index += 1

f = open('merge.json', 'r')
all_data = json.load(f)
all_data['conf_year'] = {}
all_data['conf_year']['O'] = info_arr

rename = {}
for key in all_data.keys():
    if key == 'jor':
        rename['conf'] = all_data[key]
    else:
        rename[key] = all_data[key]

out_data = json.dumps(rename)

of = open('comb_data.json', 'w')
of.write(out_data)
of.close()
