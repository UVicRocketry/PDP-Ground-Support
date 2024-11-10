import sys, json, pandas

try:
    file_name = sys.argv[1]
except:
    print('Unknown file. Pass file name in call to program')

# List of dictionaries each corresponding to set of datapoints
ds = []
try:
    with open(file_name, 'r') as file:
        print('Reading. This may take awhile...')
        lines = file.readlines()
        ds = [json.loads(line) for line in lines]
except:
    print('Unknown file name or format')

df = pandas.DataFrame(ds)

with open(file_name[:-3] + 'csv', 'w') as out_file:
    print('Converting to csv...')
    df.to_csv(out_file)

print("Done.")
