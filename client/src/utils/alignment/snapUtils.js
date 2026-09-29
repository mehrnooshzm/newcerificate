//Decide which snap to use and apply the correction.

//Check if the snap has changed and update guides accordingly.
const isSameSnap = (snapA, snapB) => {
  if (!snapA || !snapB) {
    return false;
  }

  return (
    snapA.axis === snapB.axis &&
    snapA.movingPoint === snapB.movingPoint &&
    snapA.targetPoint === snapB.targetPoint &&
    snapA.position === snapB.position &&
    snapA.target === snapB.target
  );
};

//Once an object is snapped, keep that snap until the object moves beyond releaseThreshold.
export const getClosestSnap = (
  object,
  candidates,
  axis,
  activeSnap,
  options = {}
) => {
  const snappingThreshold = options.snappingThreshold ?? 8;
  const releaseThreshold = options.releaseThreshold ?? 12;
  const axisCandidates = candidates.filter(
    (candidate) => candidate.axis === axis
  );
  const currentSnap = activeSnap[axis];

  if (currentSnap) {
    const currentCandidate = axisCandidates.find((candidate) =>
      isSameSnap(candidate, currentSnap)
    );

    if (currentCandidate && currentCandidate.distance <= releaseThreshold) {
      return currentCandidate;
    }
    activeSnap[axis] = null;
  }
  const validCandidates = axisCandidates.filter(
    (candidate) => candidate.distance <= snappingThreshold
  );

  if (validCandidates.length === 0) {
    return null;
  }
  return validCandidates.reduce((closest, candidate) => {
    if (!closest || candidate.distance < closest.distance) {
      return candidate;
    }
    return closest;
  }, null);
};

//Apply the snap to the object's position.
export const applySnap = (baseLeft, baseTop, snapX, snapY, activeSnap) => {
  let left = baseLeft;
  let top = baseTop;

  if (snapX) {
    left += snapX.offset;
    activeSnap.x = snapX;
  } else {
    activeSnap.x = null;
  }

  if (snapY) {
    top += snapY.offset;
    activeSnap.y = snapY;
  } else {
    activeSnap.y = null;
  }

  return {
    left,
    top,
  };
};
