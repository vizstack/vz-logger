import csv
from itertools import combinations
import time

from vzlogger import connect, disconnect, get_logger, DEBUG
# from vizstack import Sequence, Flow, Text, KeyValue, Token
import vizstack as vz

l = get_logger('main').level(DEBUG)


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
    l.info(url1_params, url2_params)
    for i in range(min(len(url1_params), len(url2_params))):
        if url1_params[i] != url2_params[i]:
            mismatches.append((url1_params[i], url2_params[i]))
    mismatches.extend([(param, '') for param in url1_params[min(len(url1_params), len(url2_params)):]])
    mismatches.extend([('', param) for param in url2_params[min(len(url1_params), len(url2_params)):]])
    return mismatches


def main():
    urls = load_urls()
    l.debug('all URLs:', vz.Sequence(urls, orientation='vertical'))
    url_pairs = combinations(urls, 2)
    off_by_one = []
    for url1, url2 in url_pairs:
        diffs = get_parameter_differences(url1, url2)
        # l.debug(Sequence([
        #     Flow(Text('URL pair:', emphasis='more' if len(diffs) == 1 else 'less'), url1, url2),
        #     Flow(Text('Mismatches:'), diffs)
        # ], orientation='vertical', show_labels=False))
        # l.debug(vz.KeyValue(
        #     {
        #         "pair": vz.Sequence([url1, url2], orientation='vertical'),
        #         "status": vz.Token('match', color='green') if len(diffs) == 1 else vz.Token('mismatch', color='red'),
        #         "mismatches": diffs,
        #     }
        # , align_separators=True))
        l.debug(vz.Grid('abc|def', {
            'a': vz.Text("pair", variant="body"),
            'b': vz.Text("status", variant="body"),
            'c': vz.Text('mismatches', variant="body"),
            "d": vz.Sequence([url1, url2], orientation='vertical'),
            "e": vz.Token('match', color='green') if len(diffs) == 1 else vz.Token('mismatch', color='red'),
            "f": diffs,
        }))
        if len(diffs) == 1:
            off_by_one.append((url1, url2))
    l.info(vz.Text('Off-by-one:'), vz.Sequence(off_by_one, orientation='vertical'))



if __name__ == '__main__':
    with connect():
        main()