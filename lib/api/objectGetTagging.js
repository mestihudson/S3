import async from 'async';
import { errors } from 'arsenal';

import { decodeVersionId, getVersionIdResHeader }
  from './apiUtils/object/versioning';

import { metadataValidateBucketAndObj } from '../metadata/metadataUtils';
import { pushMetric } from '../utapi/utilities';
import collectCorsHeaders from '../utilities/collectCorsHeaders';
import { convertToXml } from './apiUtils/object/tagging';

/**
 * Object Get Tagging - Return tag for object
 * @param {AuthInfo} authInfo - Instance of AuthInfo class with requester's info
 * @param {object} request - http request object
 * @param {object} log - Werelogs logger
 * @param {function} callback - callback to server
 * @return {undefined}
 */
export default function objectGetTagging(authInfo, request, log, callback) {
    log.debug('processing request', { method: 'objectGetTagging' });

    const bucketName = request.bucketName;
    const objectKey = request.objectKey;

    const decodedVidResult = decodeVersionId(request.query);
    if (decodedVidResult instanceof Error) {
        log.trace('invalid versionId query', {
            versionId: request.query.versionId,
            error: decodedVidResult,
        });
        return process.nextTick(() => callback(decodedVidResult));
    }
    const reqVersionId = decodedVidResult;

    const metadataValParams = {
        authInfo,
        bucketName,
        objectKey,
        requestType: 'bucketOwnerAction',
        versionId: reqVersionId,
    };

    return async.waterfall([
        next => metadataValidateBucketAndObj(metadataValParams, log,
          (err, bucket, objectMD) => {
              if (err) {
                  log.trace('request authorization failed',
                  { method: 'objectGetTagging', error: err });
                  return next(err);
              }
              if (!objectMD) {
                  const err = reqVersionId ? errors.NoSuchVersion :
                      errors.NoSuchKey;
                  log.trace('error no object metadata found',
                  { method: 'objectGetTagging', error: err });
                  return next(err, bucket);
              }
              if (objectMD.isDeleteMarker) {
                  log.trace('version is a delete marker',
                  { method: 'objectGetTagging' });
                  return next(errors.MethodNotAllowed, bucket);
              }
              return next(null, bucket, objectMD);
          }),
        (bucket, objectMD, next) => {
            const tags = objectMD.tags;
            const xml = convertToXml(tags);
            next(null, bucket, xml, objectMD);
        },
    ], (err, bucket, xml, objectMD) => {
        const corsHeaders = collectCorsHeaders(request.headers.origin,
            request.method, bucket);
        if (err) {
            log.trace('error processing request', { error: err,
                method: 'objectGetTagging' });
        } else {
            pushMetric('getObjectTagging', log, {
                authInfo,
                bucket: bucketName,
            });
            const verCfg = bucket.getVersioningConfiguration();
            corsHeaders['x-amz-version-id'] =
                getVersionIdResHeader(verCfg, objectMD);
        }
        return callback(err, xml, corsHeaders);
    });
}
