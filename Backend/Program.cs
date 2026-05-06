using Services;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<GridGeneratorService>();
builder.Services.AddScoped<ScoreCalculator>();
builder.Services.AddScoped<DictionaryService>();
builder.Services.AddScoped<GravityService>();
builder.Services.AddScoped<GridScannerService>();

// Swagger (API'yi tarayıcıdan test et)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<DictionaryService>();

// Controller desteği
builder.Services.AddControllers();
builder.Services.AddMemoryCache();

// CORS — React Native'in API'ye erişmesi için
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors();
app.MapControllers();

app.Run();
