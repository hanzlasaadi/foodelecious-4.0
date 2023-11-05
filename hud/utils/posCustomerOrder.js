const apiUrl = "http://127.0.0.1:9090";
const menuNavList = document.querySelector("#menuNav");
const productCardsContainer = document.querySelector("#productCardsContainer");
const posModal = document.getElementById("modalPosItem");
let currentProductCategory;
let steps = [];

const addListItemNav = function (name, id) {
  return `<li class="nav-item category-nav-item" data-category='${id}'>
  <a class="nav-link" href="#" data-filter="all">
    <div class="card" style=" border-radius:10px; border-color:#e57c35 "  >
      <div class="card-body" style="color: grey ;">${name}</div>
    </div>
  </a>
  </li>`;
};

const addProductsListCards = (id, name, image) => {
  return `<div
  class="col-xxl-3 col-xl-4 col-lg-6 col-md-4 col-sm-6 pb-4"
  data-type="meat"
  data-productId="${id}"
  id="handleShowModal"
  data-bs-toggle="modal"
  data-bs-target="#modalPosItem"
  >
  <div class="card h-100" style="border-radius:10px; border-color:#e57c35">
    <div class="card-body h-100 p-1">
      <a
        href="#"
        class="pos-product"
      >
        <div
          class="img"
          style="border-radius:10px;
            background-image: url(../assets/img/pos/countryside.jpg);
          "
        ></div>
        <div class="info" >
          <div class="title" style="color: grey;">${name}</div>
        </div>
      </a>
    </div>
  </div>
  </div>`;
};

document.addEventListener("DOMContentLoaded", () => {
  axios
    .get(`${apiUrl}/api/v1/productCategory?limit=20`)
    .then((res) => {
      menuNavList.innerHTML = "";
      res.data.data.forEach((el, i) => {
        // console.log(i);
        if (
          el.name === "Pizzas" ||
          el.name === "Wraps (Signature)" ||
          el.name === "Burgers" ||
          el.name === "Milkshakes"
        )
          menuNavList.insertAdjacentHTML(
            "beforeend",
            addListItemNav(el.name, el._id)
          );
      });
      addCategorySelectEvent();
    })
    .catch((err) => {
      console.log(err);
    });
});

const addCategorySelectEvent = () => {
  document.querySelectorAll(".category-nav-item").forEach((el, i) => {
    el.addEventListener("click", (e) => {
      document
        .querySelectorAll(".nav-link")
        .forEach((el) => el.classList.remove("active"));
      insertProductCards(e.currentTarget.dataset.category);
      e.currentTarget.querySelector(".nav-link").classList.add("active");
    });
  });
};

let currentProductsList;

const insertProductCards = (subCategoryId) => {
  axios
    .get(`${apiUrl}/api/v1/product?productCategory=${subCategoryId}`)
    .then((res) => {
      productCardsContainer.innerHTML = "";
      currentProductsList = res.data.data[0];
      currentSubCategoryId = subCategoryId;
      currentProductsList.productsList.forEach((el, i) => {
        productCardsContainer.insertAdjacentHTML(
          "beforeend",
          addProductsListCards(el._id, el.name, "")
        );
      });
      // addClickEventsOnCardsForModal();
    })
    .catch((err) => console.log(err));
};

const findSubCategory = async (subCategoryId) => {
  return await axios
    .get(`${apiUrl}/api/v1/productCategory/${subCategoryId}`)
    .then((res) => {
      currentProductCategory = res.data.data;
      return res.data.data;
    })
    .catch((err) => console.log(err));
};

const findClickedProduct = async (subCategoryId, productId) => {
  return await axios
    .get(`${apiUrl}/api/v1/product?productCategory=${subCategoryId}`)
    .then((res) => {
      return res.data.data[0].productsList.filter((el) => el._id === productId);
    })
    .catch((err) => console.log(err));
};

// const addClickEventsOnCardsForModal = () => {
//   document.querySelectorAll("[data-productId]").forEach((el) => {
//     el.addEventListener("click", (e) => {
//       console.log(e.currentTarget.dataset.productid);
//       // modalHtml("");
//     });
//   });
// };

posModal.addEventListener("show.bs.modal", async (e) => {
  e.target.querySelector("#modal-steps").innerHTML = "";
  steps = [];
  console.log(e.relatedTarget.dataset.productid);
  const subcategory = await findSubCategory(currentSubCategoryId);
  const [clickedProduct] = await findClickedProduct(
    currentSubCategoryId,
    e.relatedTarget.dataset.productid
  );
  console.log(subcategory, "subcat");
  console.log(clickedProduct, "clickedProduct");

  e.target.querySelector("#modal-title").textContent = clickedProduct.name;
  e.target.querySelector("#modal-description").textContent =
    clickedProduct.description;
  e.target.querySelector(
    "#modal-price"
  ).textContent = `${clickedProduct.price} £`;

  subcategory.stepsToChoose.forEach((step) => {
    e.target
      .querySelector("#modal-steps")
      .insertAdjacentHTML("beforeend", modalOptionsHtml(step));
  });
  // console.log(modalOptionsHtml(subcategory.stepsToChoose[0]));

  // add to cart functionality
  e.target.querySelector("#addToCart").addEventListener("click", (event) => {
    event.preventDefault();
    console.log("Hanzla");
    let arr = [];
    document.querySelectorAll("#stepToChoose").forEach((el) => {
      console.log(el.querySelector("#stepName").textContent);
      arr.push(
        Array.from(el.querySelectorAll(".option-input")).filter(
          (el) => el.checked
        )
      );
    });
    arr = arr.filter((el) => el.length !== 0);
    steps = arr.map((el) => {
      return { _id: el[0].id };
    });
    console.log(steps);
    console.log(currentProductCategory);
    console.log(currentProductsList);
  });
});

function modalOptionsHtml(stepToChoose) {
  return `<div id="stepToChoose" class="mb-2">
  <div id="stepName" class="fw-bold" style="color: black">${
    stepToChoose.stepName
  }</div>
  <div class="option-list">
    ${stepToChoose.options
      .map((op) => {
        return `<div class="option">
      <input
        type="checkbox"
        id="${op._id}"
        name="${stepToChoose.stepName}"
        class="option-input"
      />
      <label class="option-label" for="${op._id}">
        <span class="option-text" style="color: black"
          >${op.type}</span
        >
        <span class="option-price" style="color: darkgrey"
          >+${op.price}£</span
        >
      </label>
    </div>`;
      })
      .toString()
      .replaceAll(",", "")}
  </div>
</div>`;
}

// Update the cartCard function to accept selectedOptions
const cartCard = function (product, selectedOptions) {
  const selectedOptionsHtml = selectedOptions
    .map((option) => {
      return `<div class="selected-option">
      <span class="option-name">${option.stepName}: ${option.option.type}</span>
      <span class="option-price">+${option.option.price}£</span>
    </div>`;
    })
    .join("");

  return `<div class="pos-order">
    <div class="pos-order-product">
      <div class="img" style="background-image: url(../assets/img/pos/${product.image});"></div>
      <div class="flex-1">
        <div class="h6 mb-1" style="color: grey">${product.name}</div>
        <div class="small" style="color: lightgrey">$${product.price}</div>
        <div class="small mb-2" style="color: lightgrey">- size: ${product.stepName[0].type}</div>
        <div class="d-flex">
          <a href="#" class="btn btn-outline-theme btn-sm"><i class="fa fa-minus"></i></a>
          <input type="text" class="form-control w-50px form-control-sm mx-2 bg-white bg-opacity-25 bg-white bg-opacity-25 text-center" value="01" />
          <a href="#" class="btn btn-outline-theme btn-sm"><i class="fa fa-plus"></i></a>
        </div>
      </div>
    </div>
    <div class="pos-order-price">$${product.price}</div>
    <div class="selected-options">${selectedOptionsHtml}</div>
  </div>`;
};
