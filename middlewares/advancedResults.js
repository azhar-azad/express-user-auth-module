const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude (does not search for those while filtering, though they are present in req.query)
  const removeParams = ['select', 'sort', 'page', 'limit'];
  // Loop over removeFields and delete them from request query
  removeParams.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  query = model.find(JSON.parse(queryStr));

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields); // select is mongoose method to select selective fields
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    // Default = sort by date
    query = query.sort('-createdAt');
  }

  // Pagination

  // To show certain page.
  // If limit is 2 then, first 2 items make page 1, second 2 will make page 2 and so on
  const page = parseInt(req.query.page, 10) || 1;

  const limit = parseInt(req.query.limit, 10) || 25; // 25 as 25 results will be returns as defualt

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments(); // total is the all the bootcamps in the db

  query = query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

  // Executing query
  const results = await query;

  // Pagination result
  const pagination = {};

  // Only show next page number if available
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    }
  }

  // Only show previous page number if available
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    }
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results
  };

  next();
};

module.exports = advancedResults;