(function () {
  "use strict";

  let menuItems = [];
  let cartItems = [];
  let profileData = {
    firstName: "",
    lastName: "",
    reward: 0
  };
  let totalPrice = {
    value: 0
  };
  let menuLoaded = {
    value: false
  };
  let checkoutState = {
    value: false
  };
  let tableID = {
    value: ""
  };
  let main = new Vue({
    el: "#spinner",
    data: {
      menuLoaded: menuLoaded
    }
  });
  let profile = new Vue({
    el: "#profile",
    data: {
      profileData: profileData
    },
    created: function () {
      updateProfile();
    },
    methods: {
      gotoSignIn: gotoSignIn
    }
  });

  let cart = new Vue({
    el: "#cart",
    data: {
      tableID: tableID,
      items: cartItems,
      totalPrice: totalPrice,
      checkoutState: checkoutState,
      menuLoaded: menuLoaded,
      inProgress: false
    },
    created: function () {
      let url_vars = getUrlVars();
      let member_id = url_vars["member_id"];
      if (member_id == undefined) {
        gotoSignIn();
      }
      // TODO: Replace URL for "01-10 Get Order API-Task"
      let url = "xxxx";
      let token = "snaplogic_ml_showcase";
      let params = { member_id: member_id };
      function action(responseJson) {
        console.log(responseJson);
        tableID.value = responseJson["table_id"];
        let orders = responseJson["orders"];
        for (let i = 0; i < orders.length; i++) {
          cartItems.push({
            menu_id: orders[i].menu_id,
            amount: orders[i].amount,
            price: { size: orders[i].size },
            status: 1
          });
        }
      }
      requestSnapLogic(url, token, params, action);
    },
    methods: {
      getPriceLabel: function (priceId) {
        let label = ["", "S", "M", "L"];
        return label[priceId];
      },
      canCheckout: function () {
        if (cartItems.length == 0) {
          return false;
        }
        for (let i = 0; i < cartItems.length; i++) {
          if (cartItems[i].status == 0) {
            return false;
          }
        }
        return true;
      },
      checkout: function () {
        checkoutState.value = true;
      },
      submit: function () {
        if (this.inProgress) {
          return;
        }
        let self = this;
        this.inProgress = true;
        let orders = [];
        for (let i = 0; i < cartItems.length; i++) {
          if (cartItems[i].status == 0) {
            cartItems[i].status = 1;
            orders.push({
              menu_id: cartItems[i].menu_id,
              amount: cartItems[i].amount,
              size: cartItems[i].price.size
            });
          }
        }
        // TODO: Replace URL for "01-11 Add Order API-Task"
        let url = "xxxx";
        let token = "snaplogic_ml_showcase";
        let params = { table_id: self.tableID.value, orders: orders };
        function action(responseJson) {
          console.log(responseJson);
          self.inProgress = false;
          swal({
            type: "success",
            title: "Order submitted!",
            showConfirmButton: false,
            timer: 1500
          });
        };
        requestSnapLogic(url, token, params, action);
      },
      increaseItem: function (item) {
        if (item.status != 0) {
          return;
        }
        item.amount++;
        updateTotalPrice();
      },
      decreaseItem: function (item) {
        if (item.status != 0) {
          return;
        }
        if (item.amount > 1) {
          item.amount--;
          updateTotalPrice();
        }
      },
      removeItem: function (item) {
        console.log(item);
        for (let i = 0; i < cartItems.length; i++) {
          if (
            cartItems[i].menu_id == item.menu_id &&
            cartItems[i].price.size == item.price.size &&
            cartItems[i].status == 0
          ) {
            cartItems.splice(i, 1);
            updateTotalPrice();
            break;
          }
        }
      }
    }
  });

  let info = new Vue({
    el: "#info",
    data: {
      items: menuItems,
      menuLoaded: menuLoaded,
      checkoutState: checkoutState,
      paymentMethod: "credit",
      inProgress: false,
      creditName: "",
      creditNumber: "",
      creditExpire: "",
      creditCVV: ""
    },
    created: function () {
      // TODO: Replace URL for "01-09 Get Menu API-Task"
      let url = "xxxx";
      let token = "snaplogic_ml_showcase";
      let data = []
      function action(responseJson) {
        let menuList = responseJson[0].items;
        for (let i = 0; i < menuList.length; i++) {
          let item = {
            id: menuList[i]["menu_id"],
            name: menuList[i]["title"],
            prices: extractPriceList(menuList[i]),
            img: menuList[i]["image_url"]
          };
          menuItems.push(item);
        }
        updateCartInfo();
        updateTotalPrice();
        menuLoaded.value = true;
      }
      requestSnapLogicTrigger(url, token, data, action);
    },
    methods: {
      selectMenu: function (item, price) {
        let added = false;
        for (let i = 0; i < cartItems.length; i++) {
          if (
            cartItems[i].menu_id == item.id &&
            cartItems[i].price.size == price.size &&
            cartItems[i].status == 0
          ) {
            cartItems[i].amount = cartItems[i].amount + 1;
            added = true;
            break;
          }
        }
        if (!added) {
          const newItem = {
            menu_id: item.id,
            name: item.name,
            amount: 1,
            price: price,
            status: 0
          };
          cartItems.push(newItem);
        }
        updateTotalPrice();
      },
      pay: function () {
        if (this.inProgress) {
          return;
        }
        if (this.paymentMethod == "credit") {
          if (
            this.creditName.trim().length == 0 ||
            this.creditNumber.trim().length == 0 ||
            this.creditExpire.trim().length == 0 ||
            this.creditCVV.trim().length == 0
          ) {
            swal({
              type: "error",
              title: "No credit card information",
              text: "Please fill in credit card information"
            });
            return;
          }
        }

        this.inProgress = true;
        let self = this;
        // TODO: Replace URL for "01-13 Make Payment API-Task"
        let url = "xxxx";
        let token = "snaplogic_ml_showcase";
        let params = {
          table_id: tableID.value,
          amount: totalPrice.value,
          type: self.paymentMethod
        }
        function action(responseJson) {
          console.log(responseJson);
          self.inProgress = false;
          updateProfile(function () {
            swal({
              type: "success",
              title: `You now have ${profileData.reward} reward`
            }).then(result => {
              gotoSignIn();
            });
          });
        }
        function action_fail(xhr) { self.inProgress = false; }
        requestSnapLogic(url, token, params, action, action_fail);
      }
    }
  });
  function gotoSignIn() {
    window.location = "./signin.html";
  }
  function extractPriceList(menu) {
    let priceList = [];
    let price1 = menu["price1"];
    let price2 = menu["price2"];
    let price3 = menu["price3"];
    let price1Added = false;
    if (price2.trim().length != 0) {
      if (price1.trim().length > 0) {
        priceList.push({ size: 1, value: price1 });
      }
      priceList.push({ size: 2, value: price2 });
      price1Added = true;
    }
    if (price3.trim().length != 0) {
      if (!price1Added) {
        if (price1.trim().length > 0) {
          priceList.push({ size: 1, value: price1 });
        }
      }
      priceList.push({ size: 3, value: price3 });
    }
    if (!price1Added) {
      priceList.push({ size: 1, value: price1 });
    }
    return priceList;
  }
  function updateCartInfo() {
    for (let i = 0; i < cartItems.length; i++) {
      let item = cartItems[i];
      let menu = findMenu(item.menu_id);
      if (menu != null) {
        item.name = menu.name;
        item.price.value = findMenuPrice(menu, item.price.size);
      }
    }
  }

  function findMenuPrice(menu, size) {
    for (let i = 0; i < menu.prices.length; i++) {
      if (menu.prices[i].size == size) {
        return menu.prices[i].value;
      }
    }
  }

  function findMenu(menuId) {
    for (let i = 0; i < menuItems.length; i++) {
      if (menuItems[i].id == menuId) {
        return menuItems[i];
      }
    }
    return null;
  }

  function updateTotalPrice() {
    let sum = 0;
    for (let i = 0; i < cartItems.length; i++) {
      sum += cartItems[i].amount * cartItems[i].price.value;
    }
    totalPrice.value = sum;
  }
  function updateProfile(action_profile) {
    let url_vars = getUrlVars();
    let member_id = url_vars["member_id"];
    // TODO: Replace URL for "01-07 Get Member Info API-Task"
    let url = "xxxx";
    let token = "snaplogic_ml_showcase";
    let params = { member_id: member_id };
    function action(responseJson) {
      console.log(responseJson);
      profileData.firstName = responseJson.firstname;
      profileData.lastName = responseJson.lastname;
      profileData.reward = responseJson.reward;
      if (action_profile != undefined) {
        action_profile();
      }
    }
    requestSnapLogic(url, token, params, action)
  }
})();
