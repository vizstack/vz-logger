cd frontend
npm run build
cd ..
cd server
npm run build
rm -rf build
mkdir build
cp -r ../frontend/build .
