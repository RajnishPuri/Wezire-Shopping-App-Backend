# Wezire Shopping App Backend

A robust backend service for the Wezire Shopping Application that handles customer and seller authentication.

## 🚀 Features

* Customer Authentication System
* Seller Authentication System


## 🛠️ API Endpoints

### Customer Routes


| Endpoint       | URL                                                      | Description                            |
| -------------- | -------------------------------------------------------- | -------------------------------------- |
| OTP Generation | `http://localhost:3000/api/customer/auth/create-otp`     | Generate OTP for customer verification |
| Register       | `http://localhost:3000/api/customer/auth/register`       | Register new customer                  |
| Login          | `http://localhost:3000/api/customer/auth/login`          | Customer login                         |
| Logout         | `http://localhost:3000/api/customer/auth/logout`         | Customer logout                        |
| Get Details    | `http://localhost:3000/api/customer/auth/getUserDetails` | Retrieve customer details              |
| Delete Account | `http://localhost:3000/api/customer/auth/deleteUser`     | Delete customer account                |

### Seller Routes


| Endpoint       | URL                                                    | Description                          |
| -------------- | ------------------------------------------------------ | ------------------------------------ |
| OTP Generation | `http://localhost:3000/api/seller/auth/create-otp`     | Generate OTP for seller verification |
| Register       | `http://localhost:3000/api/seller/auth/register`       | Register new seller                  |
| Login          | `http://localhost:3000/api/seller/auth/login`          | Seller login                         |
| Logout         | `http://localhost:3000/api/seller/auth/logout`         | Seller logout                        |
| Get Details    | `http://localhost:3000/api/seller/auth/getUserDetails` | Retrieve seller details              |

## 🚦 Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/Wezire-Shopping-App-Backend.git
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the server:

   ```sql
   npm start
   ```


## 🔧 Environment Variables

Create a `.env` file in the root directory and add:

```ini
DATABASE_URL="POSTGREE URL"
PORT = 3000
JWT_SECRET = "your-secret-key"
EMAIL = "YOUR EMAIL"
EMAIL_PASSWORD = "YOUR EMAIL PASSWORD"
FOLDER_NAME = "YOUR FOLDER NAME"
RAZORPAY_KEY= "YOUR RAZORPAY KEY"
RAZORPAY_SECRET= "YOUR RAZORPAY SECRET"
CLOUD_NAME = "YOUR CLOUDINARY NAME"
API_KEY_CLOUDINARY = "YOUR CLOUDINARY API KEY"
API_SECRET_CLOUDINARY = "YOUR CLOUDINARY API SECRET"
```


## 🛡️ Security

* JWT Authentication
* OTP Verification
* Secure Password Hashing

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, email [support@wezire.com](vscode-webview://0gk9r0uqtk2qduh2lcibo2tefdvk72qgbkmbo327ieev3h8sorg2/index.html?id=5e2ada24-cc55-4640-b8c6-419449cb5043&origin=80bfeb32-10a2-492e-a655-6bf19191bd9b&swVersion=4&extensionId=sourcegraph.cody-ai&platform=electron&vscode-resource-base-authority=vscode-resource.vscode-cdn.net&parentOrigin=vscode-file%3A%2F%2Fvscode-app) or join our Slack channel.
