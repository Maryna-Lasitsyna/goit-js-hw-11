import NewsApiService from './js/api-service';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { lightbox } from './js/lightbox';
import './style.css';

const refs = {
  searchForm: document.querySelector('.search-form'),
  galleryContainer: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

let isShow = 0;
const newsApiService = new NewsApiService();

refs.searchForm.addEventListener('submit', onSearch);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

function onSearch(event) {
  event.preventDefault();

  refs.galleryContainer.innerHTML = '';
  newsApiService.query = event.currentTarget.elements.searchQuery.value.trim();
  newsApiService.resetPage();

  if (newsApiService.query === '') {
    Notify.warning('Please, fill in the search field.');
    return;
  }

  isShow = 0;
  fetchGallery();
}

function onLoadMore() {
  newsApiService.incrementPage();
  fetchGallery();
}

async function fetchGallery() {
  refs.loadMoreBtn.classList.add('is-hidden');

  const result = await newsApiService.fetchGallery();
  const { hits, total, page } = result;
  isShow += hits.length;

  if (!hits.length && page === 1) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.`'
    );

    return;
  }

  onRenderGallery(hits);

  if (isShow < total) {
    Notify.success('Hooray! We found ${total} images!');
    refs.loadMoreBtn.classList.remove('is-hidden');
  } else {
    Notify.info('Sorry, but you ve reached the end of search results.');
  }

  if (isShow >= total) {
    refs.loadMoreBtn.classList.add('is-hidden');
  }
}


function onRenderGallery(element) {
  const markup = element
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card">
       <a href="${largeImageURL}">
        <img class="photo-img" src="${webformatURL}" alt="${tags}" loading="lazy" />
       </a>
        <div class="info">
          <p class="info-item">
            <b>Likes</b>
            ${likes}
          </p>
          <p class="info-item">
            <b>Views</b>
            ${views}
          </p>
          <p class="info-item">
            <b>Comments</b>
            ${comments}
          </p>
          <p class="info-item">
            <b>Downloads</b>
            ${downloads}
          </p>
        </div>
        </div>`;
      }
    )
    .join('');
  refs.galleryContainer.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
}
