import assert from 'assert';
import async from 'async';

import withV4 from '../support/withV4';
import BucketUtility from '../../lib/utility/bucket-util';

const bucketName = 'testtaggingbucket';
const objectName = 'testtaggingobject';

const taggingConfig = { TagSet: [
    {
        Key: 'key1',
        Value: 'value1',
    },
    {
        Key: 'key2',
        Value: 'value2',
    },
] };

function _checkError(err, code, statusCode) {
    assert(err, 'Expected error but found none');
    assert.strictEqual(err.code, code);
    assert.strictEqual(err.statusCode, statusCode);
}

describe('GET object taggings', () => {
    withV4(sigCfg => {
        const bucketUtil = new BucketUtility('default', sigCfg);
        const s3 = bucketUtil.s3;

        beforeEach(done => {
            async.waterfall([
                next => s3.createBucket({ Bucket: bucketName }, err =>
                  next(err)),
                next => s3.putObject({ Bucket: bucketName, Key: objectName },
                  err => next(err)),
            ], done);
        });

        afterEach(() => {
            process.stdout.write('Emptying bucket');
            return bucketUtil.empty(bucketName)
            .then(() => {
                process.stdout.write('Deleting bucket');
                return bucketUtil.deleteOne(bucketName);
            })
            .catch(err => {
                process.stdout.write('Error in afterEach');
                throw err;
            });
        });

        it('should return appropriate tags after putting tags', done => {
            s3.putObjectTagging({
                Bucket: bucketName,
                Key: objectName,
                Tagging: taggingConfig,
            }, err => {
                assert.ifError(err, `putObjectTagging error: ${err}`);
                s3.getObjectTagging({ Bucket: bucketName, Key: objectName },
                (err, data) => {
                    assert.ifError(err, `getObjectTagging error: ${err}`);
                    assert.deepStrictEqual(data, taggingConfig);
                    done();
                });
            });
        });

        it('should return empty array after putting no tag', done => {
            s3.getObjectTagging({ Bucket: bucketName, Key: objectName },
            (err, data) => {
                assert.ifError(err, `getObjectTagging error: ${err}`);
                assert.deepStrictEqual(data.TagSet, []);
                done();
            });
        });

        it('should return NoSuchKey getting tag to a non-existing object',
        done => {
            s3.getObjectTagging({
                Bucket: bucketName,
                Key: 'nonexisting',
            }, err => {
                _checkError(err, 'NoSuchKey', 404);
                done();
            });
        });
    });
});
