const User = require("../models/user");
const Address = require("../models/address");

exports.addUserAddress = async (req, res) => {
  const { address } = req.body;
  const userID = req.session.user._id;

  try {
    // Find the user by ID
    const user = await User.findById(userID).populate("addresses");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user already has an address document
    let userAddress = await Address.findOne({ userID: userID });

    if (!userAddress) {
      // If no address document exists, create a new one
      userAddress = new Address({
        userID: userID,
        addresses: { addressList: [] },
      });
    }

    // Add the new address to the address list
    userAddress.addresses.addressList.push({
      name: address.name,
      address: address.address,
      contact: address.contact,
      pincode: address.pincode,
      city: address.city,
      state: address.state,
    });

    // Save the updated address document
    await userAddress.save();

    // Update the user's addresses reference
    user.addresses = userAddress._id;
    await user.save();

    res.status(200).json({ message: "Address added successfully" });
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.removeUserAddress = async (req, res) => {
  const { addressId } = req.body;
  const userID = req.session.user._id;

  try {
    // Find the user's address document
    let userAddress = await Address.findOne({ userID: userID }).populate(
      "addresses.addressList"
    );

    

    if (!userAddress) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Find the index of the address in the address list
    const existingAddressIndex = userAddress.addresses.addressList.findIndex(
      (address) => address._id.toString() === addressId
    );

    console.log(existingAddressIndex);

    if (existingAddressIndex >= 0) {
      // Remove the address from the address list
      userAddress.addresses.addressList.splice(existingAddressIndex, 1);

      // Save the updated address document
      await userAddress.save();
      res.status(200).json(userAddress);
    } else {
      res.status(404).json({ message: "Address not found" });
    }
  } catch (error) {
    console.error("Error removing address:", error);
    res.status(500).json({ message: "Server error" });
  }
};



exports.getUserAddresses = async (req, res) => {
  const userID = req.session.user._id;
  // console.log(userID);

  try {
    // Find the user by ID and populate the addresses field
    const user = await User.findById(userID).populate("addresses");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract addresses from populated user document
    const addresses = user.addresses;

    res.status(200).json({
      message: "Addresses retrieved successfully",
      addresses: addresses,
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ message: "Server error" });
  }
};
