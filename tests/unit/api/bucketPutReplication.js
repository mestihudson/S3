import { errors } from 'arsenal';
import assert from 'assert';

import bucketPut from '../../../lib/api/bucketPut';
import bucketPutReplication from '../../../lib/api/bucketPutReplication';
import { cleanup, DummyRequestLogger, makeAuthInfo } from '../helpers';

const log = new DummyRequestLogger();
const canonicalID = 'accessKey1';
const authInfo = makeAuthInfo(canonicalID);
const namespace = 'default';
const bucketName = 'bucketname';
const testBucketPutRequest = {
    bucketName,
    namespace,
    headers: { host: `${bucketName}.s3.amazonaws.com` },
    url: '/',
};

// const elements = {
//     Role: 'arn:aws:iam::668546647514:role/replication-role',
//     Rule,
//     ID: 'test-replication-configuration',
//     Prefix: 'test',
//     Status: 'Enabled',
//     Destination,
//     Bucket: 'destination-bucket',
//     StorageClass: 'STANDARD',
// };
//
// const elements = [
//     'Role',
//     'Rule',
//     'ID',
//     'Prefix',
//     'Status',
//     'Destination',
//     'Bucket',
//     'StorageClass',
// ];

// Create invalid replication configuration XML
function createReplicationXML(missingElement) {
    const xml = [];

    xml.push('<ReplicationConfiguration ' +
        'xmlns="http://s3.amazonaws.com/doc/2006-03-01/">'
    );
    if (missingElement !== 'Role') {
        xml.push('<Role>arn:aws:iam::012345678901:role/replication</Role>');
    }
    if (missingElement !== 'Rule') {
        xml.push('<Rule>');
        if (missingElement !== 'ID') {
            xml.push('<ID>test</ID>');
        }
        if (missingElement !== 'Prefix') {
            xml.push('<Prefix>test</Prefix>');
        }
        if (missingElement !== 'Status') {
            xml.push('<Status>Enabled</Status>');
        }
        if (missingElement !== 'Destination') {
            xml.push('<Destination>');
            if (missingElement !== 'Bucket') {
                xml.push('<Bucket>test-bucket</Bucket>');
            }
            if (missingElement !== 'StorageClass') {
                xml.push('<StorageClass>STANDARD</StorageClass>');
            }
            xml.push('</Destination>');
        }
        xml.push('</Rule>');
    }
    xml.push('</ReplicationConfiguration>');
    return xml.join('');
}

function getReplicationRequest(post) {
    return {
        bucketName,
        namespace,
        headers: { host: `${bucketName}.s3.amazonaws.com` },
        post,
        url: '/?replication',
        query: { replication: '' },
    };
}

// <ReplicationConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
//     <Role>arn:aws:iam::012345678901:role/replication</Role>
//     <Rule>
//         <ID>test</ID>
//         <Prefix>test</Prefix>
//         <Status>Enabled</Status>
//         <Destination>
//             <Bucket>test-bucket</Bucket>
//             <StorageClass>STANDARD</StorageClass>
//         </Destination>
//     </Rule>
// </ReplicationConfiguration>

// COMPLETE XML
// <ReplicationConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
//     <Role>arn:aws:iam::668546647514:role/replication-role</Role>
//     <Rule>
//         <ID>test-replication-configuration</ID>
//         <Prefix/>
//         <Status>Enabled</Status>
//         <Destination>
//             <Bucket>bennett-destination-bucket</Bucket>
//             <StorageClass>STANDARD</StorageClass>
//         </Destination>
//     </Rule>
// </ReplicationConfiguration>

// <ReplicationConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
//     <Rule>
//         <ID>test-replication-configuration</ID>
//         <Prefix/>
//         <Status>Enabled</Status>
//         <Destination>
//             <Bucket>bennett-destination-bucket</Bucket>
//             <StorageClass>STANDARD</StorageClass>
//         </Destination>
//     </Rule>
// </ReplicationConfiguration>

describe('putBucketReplication API', () => {
    // before(() => cleanup());
    // beforeEach(done => bucketPut(authInfo, testBucketPutRequest, log, done));
    // afterEach(() => cleanup());

    it.only('should return an error if xml provided does not contain Role',
    done => {
        const post = createReplicationXML('Role');
        const req = getReplicationRequest(post);
        bucketPutReplication(authInfo, req, log, err => {
            assert.strictEqual(err.MalformedXML, true);
            done();
        });
    });
});
