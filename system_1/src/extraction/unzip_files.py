
import os
import gzip
import shutil

def decompress_gz(file_path, output_path):
    with gzip.open(file_path, 'rb') as f_in:
        with open(output_path, 'wb') as f_out:
            shutil.copyfileobj(f_in, f_out)

def main():
    base_dir = 'system_1/PDN_S1/states'
    for state_folder in os.listdir(base_dir):
        state_path = os.path.join(base_dir, state_folder)
        if os.path.isdir(state_path):
            gz_file = os.path.join(state_path, 'completo.json.gz')
            if os.path.exists(gz_file):
                output_file = os.path.join(state_path, 'completo.json')
                print(f'Decompressing {gz_file} to {output_file}...')
                decompress_gz(gz_file, output_file)
                print(f'Decompression of {gz_file} complete.')

if __name__ == '__main__':
    main()
