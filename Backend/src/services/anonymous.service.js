const AnonymousIdentity = require('../models/AnonymousIdentity');

/**
 * Anonymous Service
 * Handles anonymous identity generation for community posts
 */

// Generate identity for a user (creates if not exists)
const generateAnonymousIdentity = async (userId) => {
  return await AnonymousIdentity.generateIdentity(userId);
};

// Get existing identity
const getAnonymousIdentity = async (userId) => {
  return await AnonymousIdentity.getIdentity(userId);
};

// Controller-compatible alias
const getIdentity = async (userId) => {
  return await getAnonymousIdentity(userId);
};

// Get display name only
const getDisplayName = async (userId) => {
  const identity = await getAnonymousIdentity(userId);
  return identity.displayName;
};

// Bulk get identities for multiple users
const getBulkIdentities = async (userIds) => {
  const uniqueIds = [...new Set(userIds.map(id => id.toString()))];
  const identities = await Promise.all(
    uniqueIds.map(id => getAnonymousIdentity(id))
  );
  
  const identityMap = {};
  identities.forEach((identity, index) => {
    identityMap[uniqueIds[index]] = identity.displayName;
  });
  
  return identityMap;
};

// Controller-compatible method:
// returns array of identity documents in same order as provided userIds
const getMultipleIdentities = async (userIds = []) => {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return [];
  }

  const uniqueIds = [...new Set(userIds.map(id => id.toString()))];
  const identities = await Promise.all(uniqueIds.map(id => getIdentity(id)));

  const identityMap = {};
  identities.forEach((identity, index) => {
    identityMap[uniqueIds[index]] = identity;
  });

  return userIds.map(id => identityMap[id.toString()]);
};

module.exports = {
  generateAnonymousIdentity,
  getAnonymousIdentity,
  getIdentity,
  getDisplayName,
  getBulkIdentities,
  getMultipleIdentities
};
