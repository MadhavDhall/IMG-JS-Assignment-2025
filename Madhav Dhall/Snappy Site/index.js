document.addEventListener('DOMContentLoaded', function () {
    loadCategories()

    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    loadItems(category);
})

const loadCategories = async () => {
    try {
        const response = await fetch('http://43.205.110.71:8000/categories');
        const data = await response.json();
        const categoryList = document.getElementById('category-list');
        categoryList.innerHTML = ''; // Clear existing categories
        data.forEach(category => {
            categoryList.innerHTML += `
            <li>
                    <a href="?category=${category.category}" class="w-full text-left px-4 py-2 rounded hover:bg-gray-700 focus:bg-gray-700 capitalize">${category.category}</a>
                </li>
            `
        });
    } catch (error) {
        console.log(error);

    }
}

const loadItems = async (category) => {
    try {
        const response = category ? await fetch(`http://43.205.110.71:8000/categories/${category}/items`) : await fetch('http://43.205.110.71:8000/items');
        const data = await response.json();
        const itemList = document.getElementById('item-list');
        itemList.innerHTML = ''; // Clear existing items
        data.forEach(item => {
            const tags = item.tags.split("|")
            itemList.innerHTML += `
            <div class="bg-white rounded-lg shadow p-5 flex flex-col">
                    <h3 class="text-lg font-semibold mb-2">${item.name}</h3>
                    <div class="text-sm text-gray-700 space-y-1">
                        <div><span class="font-medium">ID:</span> ${item.id}</div>
                        <div><span class="font-medium">Category:</span> ${item.category}</div>
                        <div><span class="font-medium">Subcategory:</span> ${item.subcategory}</div>
                        <div><span class="font-medium">Brand:</span> ${item.brand}</div>
                        <div><span class="font-medium">SKU:</span> ${item.sku}</div>
                        <div><span class="font-medium">Price:</span> $${item.price}</div>
                        <div><span class="font-medium">Description:</span> ${item.description}</div>
                        <div><span class="font-medium">Weight:</span> ${item.weight_kg}</div>
                        <div><span class="font-medium">Dimensions:</span> ${item.dimensions_cm}</div>
                        <div><span class="font-medium">Stock:</span> ${item.stock}</div>
                        <div>
                            <span class="font-medium">Tags:</span>
                            ${tags.map(tag => `<span class="inline-block bg-indigo-100 text-indigo-700 rounded px-2 py-0.5 text-xs mr-1">${tag}</span>`).join('')
                }
                        </div>
                    </div>
                </div>
            `
        });
    } catch (error) {
        console.log(error);
    }
}
