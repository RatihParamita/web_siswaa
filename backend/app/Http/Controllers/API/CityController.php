<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\City;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CityController extends Controller
{
    public function index()
    {
        return City::orderBy('name', 'asc')->get();
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:cities,name',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $city = City::create($request->all());
        return response()->json($city, 201);
    }

    public function show(City $city)
    {
        return $city;
    }

    public function update(Request $request, City $city)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:cities,name,' . $city->id,
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $city->update($request->all());
        return response()->json($city, 200);
    }

    public function destroy(City $city)
    {
        $city->delete();
        return response()->json(null, 204);
    }
}