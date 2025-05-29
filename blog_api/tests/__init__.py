from .auth_tests import AuthenticationTests
from .bookmark_tests import BookmarkPostViewTests, BookmarkListViewTests, BookmarkInstanceViewTests
from .comment_tests import CommentViewTests
from .image_tests import ImageViewTests
from .like_tests import LikeViewTests
from .post_tests import PostViewTests
from .profile_tests import ProfileViewTests, MeProfileViewTests, UsernameProfileViewTests

__all__ = [
    "AuthenticationTests",
    "BookmarkPostViewTests", "BookmarkListViewTests", "BookmarkInstanceViewTests",
    "CommentViewTests",
    "ImageViewTests",
    "LikeViewTests",
    "PostViewTests",
    "ProfileViewTests", "MeProfileViewTests", "UsernameProfileViewTests"
]