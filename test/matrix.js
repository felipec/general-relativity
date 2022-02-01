#!/usr/bin/env qunit

import { mul } from '../matrix.js';
import QUnit from 'qunit';

const { test } = QUnit;

const do_test = (name, a, b, e) => test(name, t => { t.deepEqual(mul(a, b), e); });

do_test('simple', [ [1, 2] ], [ [3], [4] ], [ [11] ]);
do_test('complex', [ [2, 4], [-1, -2], [7, -12] ], [ [5], [-3] ], [ [-2], [1], [71] ]);
do_test('by three', [ [2, 5, 2], [1, 0, -2], [3, 1, 1] ], [ [-2, 1, 0], [-2, 2, 1], [0, 0, 3] ], [ [-14, 12, 11], [-2, 1, -6], [-8, 5, 4] ]);
do_test('dot product', [ [1, 3, -5] ], [ [4], [-2], [-1] ], [ [3] ]);
