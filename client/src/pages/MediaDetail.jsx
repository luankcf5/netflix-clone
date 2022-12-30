import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

import { LoadingButton } from "@mui/lab";
import { Box, Button, Chip, Divider, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

import CastSlide from "../components/common/CastSlide";
import CircularRate from "../components/common/CircularRate";
import Container from "../components/common/Container";
import ImageHeader from "../components/common/ImageHeader";

import tmdbConfigs from "../api/configs/tmdb.configs";
import favoriteApi from "../api/modules/favorite.api";
import mediaApi from "../api/modules/media.api";
import uiConfigs from "../configs/ui.configs";

import BackdropSlide from "../components/common/BackdropSlide";
import MediaReview from "../components/common/MediaReview";
import MediaVideosSlide from "../components/common/MediaVideosSlide";
import PosterSlide from "../components/common/PosterSlide";
import { setAuthModalOpen } from "../redux/features/authModalSlice";
import { setGlobalLoading } from "../redux/features/globalLoadingSlice";
import { addFavorite, removeFavorite } from "../redux/features/userSlice";
import MediaSlide from "../components/common/MediaSlide";
import RecommendSlide from "../components/common/RecommendSlide";

const MediaDetail = () => {
  const { mediaType, mediaId } = useParams();

  const { user, listFavorites } = useSelector((state) => state.user);

  const [media, setMedia] = useState();
  const [isFavorite, setIsFavorite] = useState(false);
  const [onRequest, setOnRequest] = useState(false);
  const [genres, setGenres] = useState([]);

  const dispatch = useDispatch();

  const videoRef = useRef(null);

  useEffect(() => {
    const getMedia = async () => {
      dispatch(setGlobalLoading(true));
      const { response, err } = await mediaApi.getDetail({
        mediaType,
        mediaId,
      });
      dispatch(setGlobalLoading(false));

      if (response) {
        setMedia(response);
        setIsFavorite(response.isFavorite);
        setGenres(response.genres.splice(0, 2));
      }

      if (err) toast.error(err.message);
    };
    getMedia();
  }, [mediaType, mediaId, dispatch]);

  const onFavoriteClick = async () => {
    if (!user) return dispatch(setAuthModalOpen(true));

    if (onRequest) return;

    if (isFavorite) {
      onRemoveFavorite();
      return;
    }

    setOnRequest(true);

    const body = {
      mediaId: media.id,
      mediaTitle: media.title || media.name,
      mediaType: mediaType,
      mediaPoster: media.poster_path,
      mediaRate: media.vote_average,
    };

    const { response, err } = await favoriteApi.add(body);

    setOnRequest(false);

    if (err) toast.error(err.message);
    if (response) {
      dispatch(addFavorite(response));
      setIsFavorite(true);
      toast.success("Add favorite success");
    }
  };

  const onRemoveFavorite = async () => {
    if (onRequest) return;
    setOnRequest(true);

    const favorite = listFavorites.find(
      (e) => e.mediaId.toString() === media.id.toString()
    );

    const { response, err } = await favoriteApi.remove({
      favoriteId: favorite.id,
    });

    setOnRequest(false);

    if (err) toast.error(err.message);
    if (response) {
      dispatch(removeFavorite(favorite));
      setIsFavorite(false);
      toast.success("Remove favorite success");
    }
  };

  return media ? (
    <>
      <ImageHeader
        imgPath={tmdbConfigs.backdropPath(
          media.backdrop_path || media.poster_path
        )}
      />
      <Box
        sx={{
          color: "primary.contrastText",
          ...uiConfigs.style.mainContent,
        }}
      >
        <Box
          sx={{
            marginTop: { xs: "-10rem", md: "-15rem", lg: "-20rem" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { md: "row", xs: "column" },
            }}
          >
            {/* Media Poster */}
            <Box
              sx={{
                width: { xs: "70%", sm: "50%", md: "40%" },
                margin: { xs: "0 auto 2rem", md: "0 2rem 0 0" },
              }}
            >
              <Box
                sx={{
                  paddingTop: "140%",
                  ...uiConfigs.style.backgroundImage(
                    tmdbConfigs.posterPath(
                      media.poster_path || media.backdrop_path
                    )
                  ),
                }}
              />
            </Box>
            {/* Media Poster */}
            {/* Media Info */}
            <Box
              sx={{
                width: {
                  xs: "100%",
                  md: "60%",
                  color: "text.primary",
                },
              }}
            >
              <Stack spacing={5}>
                {/* Title */}
                <Typography
                  variant="h4"
                  fontSize={{
                    xs: "2rem",
                    md: "2rem",
                    lg: "4rem",
                  }}
                  fontWeight="700"
                  sx={{
                    ...uiConfigs.style.typoLines(2, "left"),
                  }}
                >{`${media.title || media.name} ${
                  mediaType === tmdbConfigs.mediaType.movie
                    ? media.release_date.split("-")[0]
                    : media.first_air_date.split("-")[0]
                }`}</Typography>
                {/* Title */}
                {/* Rate & Genres */}
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularRate value={media.vote_average} />
                  <Divider orientation="vertical" />
                  {genres.map((genre, index) => (
                    <Chip
                      key={index}
                      label={genre.name}
                      variant="filled"
                      color="primary"
                    />
                  ))}
                </Stack>
                {/* Rate & Genres */}
                {/* Overview */}
                <Typography
                  variant="body1"
                  sx={{ ...uiConfigs.style.typoLines(5, "left") }}
                >
                  {media.overview}
                </Typography>
                {/* Overview */}
                {/* Favorite & watch video */}
                <Stack direction="row" spacing={1}>
                  <LoadingButton
                    variant="text"
                    sx={{
                      width: "max-content",
                      "& .MuiButon-starIcon": { marginRight: "0" },
                    }}
                    size="large"
                    startIcon={
                      isFavorite ? (
                        <FavoriteIcon />
                      ) : (
                        <FavoriteBorderOutlinedIcon />
                      )
                    }
                    loadingPosition="start"
                    loading={onRequest}
                    onClick={onFavoriteClick}
                  />
                  <Button
                    variant="contained"
                    sx={{ width: "max-content" }}
                    size="large"
                    startIcon={<PlayArrowIcon />}
                    onClick={() => videoRef.current.scrollIntoView()}
                  >
                    WATCH NOW
                  </Button>
                </Stack>
                {/* Favorite & watch video */}
                {/* Cast */}
                <Container header="cast">
                  <CastSlide casts={media.credits.cast} />
                </Container>
                {/* Cast */}
              </Stack>
            </Box>
            {/* Media Info */}
          </Box>
        </Box>
        {/* Video Slide */}
        <div
          ref={videoRef}
          style={{
            paddingTop: "2rem",
          }}
        >
          <Container header="TRAILER">
            <MediaVideosSlide videos={[...media.videos.results]} />
          </Container>
        </div>
        {/* Video Slide */}
        {/* Backdrop & poster Image */}
        {media.images.backdrops.length > 0 && (
          <Container header="backdrops">
            <BackdropSlide backdrops={media.images.backdrops} />
          </Container>
        )}
        {media.images.posters.length > 0 && (
          <Container header="posters">
            <PosterSlide posters={media.images.posters} />
          </Container>
        )}
        {/* Backdrop & poster Image */}
        {/* media reviews */}
        <MediaReview
          reviews={media.reviews}
          media={media}
          mediaType={mediaType}
        />
        {/* media reviews */} {/* media recommendation */}
        <Container header="you may also like">
          {media.recommend.length > 0 && (
            <RecommendSlide medias={media.recommend} mediaType={mediaType} />
          )}
          {media.recommend.length === 0 && (
            <MediaSlide
              mediaType={mediaType}
              mediaCategory={tmdbConfigs.mediaCategory.top_rated}
            />
          )}
        </Container>
        {/* media recommendation */}
      </Box>
    </>
  ) : null;
};

export default MediaDetail;
