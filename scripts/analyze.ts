import 'shared/env';

import {runAnalyzeCLI} from '@rocicorp/zero/analyze';
import {schema} from '../zero/schema.ts';

await runAnalyzeCLI({schema});
