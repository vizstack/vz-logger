import csv
from itertools import combinations
import time

from vzlogger import connect, disconnect, get_logger, DEBUG
from vizstack import Sequence, Flow, Text


def load_urls():
    urls = []
    with open('dummy_urls.csv', 'rt') as infile:
        for url in infile.readlines():
            urls.append(url.strip())
    return urls


def get_parameter_differences(url1, url2):
    mismatches = []

    url1_params = url1.split('/')[3:]
    url2_params = url2.split('/')[3:]
    get_logger('main').debug(url1_params, url2_params)
    for i in range(min(len(url1_params), len(url2_params))):
        if url1_params[i] != url2_params[i]:
            mismatches.append((url1_params[i], url2_params[i]))
    mismatches.extend([(param, '') for param in url1_params[min(len(url1_params), len(url2_params)):]])
    mismatches.extend([('', param) for param in url2_params[min(len(url1_params), len(url2_params)):]])
    return mismatches


def main():
    l = get_logger('main').level(DEBUG)
    urls = load_urls()
    l.debug('All URLS:', urls)
    url_pairs = combinations(urls, 2)
    off_by_one = []
    for url1, url2 in url_pairs:
        diffs = get_parameter_differences(url1, url2)
        l.debug(Sequence([
            Flow(Text('URL pair:', emphasis='more' if len(diffs) == 1 else 'less'), url1, url2),
            Flow(Text('Mismatches:'), diffs)
        ], orientation='vertical', show_labels=False))
        if len(diffs) == 1:
            off_by_one.append((url1, url2))
    l.info(Text('Off-by-one:'), Sequence(off_by_one, orientation='vertical'))



if __name__ == '__main__':
    with connect():
        main()