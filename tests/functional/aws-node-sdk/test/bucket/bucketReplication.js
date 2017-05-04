import assert from 'assert';
import { S3 } from 'aws-sdk';

import getConfig from '../support/config';

const bucket = `replication-bucket-${Date.now()}`;

describe('aws-node-sdk test bucket replication', function testSuite() {
    this.timeout(60000);
    let s3;

    // setup test
    before(done => {
        const config = getConfig('default', { signatureVersion: 'v4' });
        s3 = new S3(config);
        s3.createBucket({ Bucket: bucket }, done);
    });

    // delete bucket after testing
    after(done => s3.deleteBucket({ Bucket: bucket }, done));

    it.skip('should not accept empty replication configuration', done => {
        const ReplicationConfiguration = {
            Role: 'STRING_VALUE',
            Rules: [
                {
                    Destination: {
                        Bucket: 'STRING_VALUE',
                        StorageClass: 'STANDARD',
                    },
                    Prefix: 'STRING_VALUE',
                    Status: 'Enabled',
                    ID: 'STRING_VALUE',
                },
            ],
        };
        const params = {
            Bucket: bucket,
            ReplicationConfiguration,
        };
        s3.putBucketReplication(params, err => {
            assert.strictEqual(err, null,
                'accepted empty replication configuration');
            // assert.strictEqual(err.statusCode, 200);
            // assert.strictEqual(err.code,
            //     'IllegalReplicationConfigurationException');
            return done();
        });
    });

    // bucketListing test
    it.skip('should do bucket listing', done => {
        s3.listBuckets((err, data) => {
            if (err) {
                return done(new Error(`error listing buckets: ${err}`));
            }
            console.log(data);
            return done();
        });
    });

    it.only('should not accept replication configuration without \'Role\'',
        done => {
            const ReplicationConfiguration = {
                // Role: "arn:aws:iam::668546647514:role/replication-role",
                Rules: [
                    {
                        Destination: {
                            Bucket: 'bennett-destination-bucket',
                            StorageClass: 'STANDARD',
                        },
                        Prefix: '',
                        Status: 'Enabled',
                        ID: 'test-replication-configuration',
                    },
                ],
            };
            const params = {
                Bucket: 'bennett-source-bucket',
                ReplicationConfiguration,
            };
            s3.putBucketReplication(params, err => {
                console.log(err);
                assert.strictEqual(err.code, 'MalformedXML', 'hello');
                done();
            });
        });
});
