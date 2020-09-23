const userCard = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('.pagination')
const User_PER_PAGE = 12
const userDataArray = []
let filterUsers = []

userDataArray.push(...JSON.parse(localStorage.getItem('favoriteList')))
renderUsers(getUserByPage(1))
renderPaginator(userDataArray)

searchForm.addEventListener('submit', function onClickSearch(event) {
  event.preventDefault()
  const inputValue = searchInput.value.trim().toLowerCase()
  searchUser(inputValue)

})

userCard.addEventListener('click', function clickVisit(event) {
  if (event.target.matches('.btn-show-user')) {
    showUserDetail(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    removeFavoriteUser(event.target.dataset.id)
  }
})

paginator.addEventListener('click', function OnClickPaginator() {
  if (event.target.tagName === 'A') {
    renderUsers(getUserByPage(Number(event.target.innerText)))
  }
})

// 搜尋好友

function searchUser(inputValue) {
  if (!inputValue.length) {
    return alert('請輸入正確名稱')
  }

  filterUsers = userDataArray.filter(user => (user.name + user.surname).toLowerCase().includes(inputValue))

  if (!filterUsers.length) {
    return alert('沒有找到相關的使用者')
  }
  renderUsers(getUserByPage(1))

  renderPaginator(filterUsers)

}

// 移除好友
function removeFavoriteUser(id) {
  if (!userDataArray) return
  const startIndex = userDataArray.findIndex(user => user.id === Number(id))
  if (startIndex === -1) return
  userDataArray.splice(startIndex, 1)
  localStorage.setItem('favoriteList', JSON.stringify(userDataArray))
  //刪除人會回去第一page 需再修改一下
  renderUsers(getUserByPage(1))
  renderPaginator(userDataArray)
}

// 分頁
function getUserByPage(page) {
  const data = filterUsers.length ? filterUsers : userDataArray
  return data.slice((page - 1) * User_PER_PAGE, page * User_PER_PAGE)
}

function renderPaginator(data) {
  const pageNumbers = Math.ceil(data.length / User_PER_PAGE)
  let rawHTML = ''
  for (let i = 1; i < pageNumbers + 1; i++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#">${i}</a></li>`
  }
  paginator.innerHTML = rawHTML
}



//渲覽畫面
function renderUsers(array) {
  let rawHTML = ''
  for (let user of array) {
    rawHTML += ` 
      <div class="card rounded-lg my-2 mx-2" style="width: 10rem;" >
        <img src="${user.avatar}" class="card-img-top img-fluid" alt="User-Image">
        <h6 class="card-title mt-1 text-center">${user.name} ${user.surname}</h6>
        <div class="card-footer px-2">
          <button class="btn btn-primary btn-show-user mr-3" style="width: 5rem" data-toggle="modal" data-target="#user-detail" data-id='${user.id}'>Visit</button>
          <button class="btn btn-danger btn-add-favorite " data-id='${user.id}'>X</button>
        </div>
          
      </div>`
  }
  userCard.innerHTML = rawHTML
}

//詳細
function showUserDetail(id) {
  const userName = document.querySelector('.modal-title')
  const userImage = document.querySelector('.modal-image')
  const userDescription = document.querySelector('.modal-description')

  axios.get('https://lighthouse-user-api.herokuapp.com/api/v1/users/' + id)
    .then(response => {
      userName.innerHTML = response.data.name + ' ' + response.data.surname
      userImage.src = response.data.avatar
      userDescription.innerHTML = `<p>Gender: ${response.data.gender}</p>
                                  <p>Region: ${response.data.region}</p>
                                  <p>Age: ${response.data.age}</p>
                                  <p>Birthday: ${response.data.birthday}</p>
                                  <p>Email: ${response.data.email}</p>`

    }).catch(error => console.log('error'))
}

