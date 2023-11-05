const apiUrl = "http://127.0.0.1:9090";
const menuNavList = document.querySelector("#menuNav");
const productCardsContainer = document.querySelector("#productCardsContainer");
const posModal = document.getElementById("modalPosItem");
let currentProductCategory;
let steps = [];
let commodityOptions = [];
let grandTotal = 0;
let currentProduct;
let commodityList = [];
let globalPaymentType = "Cash";

const addListItemNav = function (name, id) {
  return `<li class="nav-item category-nav-item" data-category='${id}'>
  <a class="nav-link" href="#" data-filter="all">
    <div class="card" style=" border-radius:10px; border-color:#e57c35 "  >
      <div class="card-body" ">${name}</div>
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
  currentProduct = {};
  commodityOptions = [];
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
      el.querySelectorAll("#optionInput");
      // console.log(el.querySelector("#stepName").textContent);
      // arr.push(
      //   Array.from(el.querySelectorAll(".option-input")).filter(
      //     (el) => el.checked
      //   )
      // );
    });
    arr = arr.filter((el) => el.length !== 0);
    steps = arr.map((el) => {
      return { _id: el[0].id };
    });

    document.querySelectorAll("#optionInput").forEach((el) => {
      el.addEventListener("click", () => {
        if (el.querySelector(".option-input").checked) {
          console.log(el.querySelector(".option-input").dataset.price);
        }
      });
    });

    // add to card
    cartCard(e.relatedTarget.dataset.productid);
  });

  document.querySelectorAll(".option-input").forEach((el) => {
    el.addEventListener("click", (e) => {
      const obj = {
        name: e.currentTarget.dataset.name,
        price: e.currentTarget.dataset.price,
        type: e.currentTarget.dataset.type,
      };
      commodityOptions.push(obj);
    });
  });
});

posModal.addEventListener("hide.bs.modal", (e) => {});

function modalOptionsHtml(stepToChoose) {
  return `<div id="stepToChoose" class="mb-2">
  <div id="stepName" class="fw-bold" style="color: black">${stepToChoose.stepName
    }</div>
  <div class="option-list">
    ${stepToChoose.options
      .map((op) => {
        return `<div class="option" id="optionInput">
      <input
        type="checkbox"
        id="${op._id}"
        name="${stepToChoose.stepName}"
        data-price="${op.price}"
        data-type="${op.type}"
        data-name="${stepToChoose.stepName}"
        class="option-input"
      />
      <label class="option-label" for="${op._id}">
        <span class="option-text" style="color: grey; font-size:larger;"
          >${op.type}</span
        >
        <span class="option-price" style="color: red; font-size:10px;"
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
const cartCard = function (productId) {
  const productPrice = commodityOptions.map((el) => +el.price);
  const totalPrice = productPrice.reduce((prev, curr) => prev + curr, 0);
  grandTotal += totalPrice;
  const [currProduct] = currentProductsList.productsList.filter((val) => {
    return val._id === productId;
  });
  currentProduct = currProduct;

  document.querySelector("#newOrderTab").insertAdjacentHTML(
    "beforeend",
    `<div class="pos-order">
    <div class="pos-order-product">
      <div class="img" style="background-image: url(../assets/img/pos/${currProduct.image});"></div>
      <div class="flex-1">
        <div class="h6 mb-1" style="color: grey">${currProduct.name}</div>
      </div>
    </div>
    <div class="pos-order-price">$${totalPrice}</div>
  </div>`
  );

  commodityObj = {
    barcode: "123hanzla",
    name: currProduct.name,
    subCategory: currentProductCategory._id,
    productPrice: totalPrice,
    options: commodityOptions,
  };
  commodityList.push(commodityObj);
};

// submit order
document.querySelector("#submitOrder").addEventListener("click", (e) => {
  e.preventDefault();
  console.log(grandTotal);
  const orderObj = {
    workerId: "654111bab8f20fc4157388f0",
    paymentType: globalPaymentType,
    totalPrice: grandTotal,
    status: "pending",
    commodityList,
  };
});
