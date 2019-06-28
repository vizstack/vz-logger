import { getLogger } from './';

// TODO: Figure out how to test better.
test('basic', (done) => {
    const logger = getLogger('MyTestLogger');
    function shouldSeeThisFunctionInOutput() {
        logger.info("hello", "world");
    }

    shouldSeeThisFunctionInOutput();
    
    setTimeout(() => {
        done();
    }, 100);
});

export {};