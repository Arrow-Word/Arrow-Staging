// Guest-only authentication and progress functions for the separate test site.
// This deliberately does not connect to Supabase or any other database.
function sbOnUserChanged(callback) {
  if (typeof callback === 'function') callback(null);
  return function unsubscribe() {};
}

function sbGetUser() {
  return null;
}

async function sbSignInGoogle() {
  alert('Sign-in is disabled on this test site. Continue as a guest instead.');
  return null;
}

async function sbSignInFacebook() {
  alert('Sign-in is disabled on this test site. Continue as a guest instead.');
  return null;
}

async function sbSignOut() {
  return true;
}

async function sbSaveProgress() { return false; }
async function sbLoadProgress() { return null; }
async function sbLoadAllProgress() { return {}; }
async function sbIncrementCheckCount() { return false; }
async function sbSaveRating() { return false; }
async function sbGetRatings() { return []; }
async function sbSaveTimeSpent() { return false; }
async function sbSaveComment() { return false; }
async function sbLoadCommentsForPuzzle() { return []; }
async function sbGetUserRole() { return 'guest'; }
async function sbGetBuilder() { return null; }
async function sbAdminGetAllProgress() { return []; }
async function sbAdminGetAllUsers() { return []; }
async function sbAdminGetAllRoles() { return []; }
async function sbAdminGetAllComments() { return []; }
async function sbAdminGetRatings() { return []; }
async function sbAdminSetRole() { return false; }
