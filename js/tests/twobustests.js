'use strict';

jest.unmock('../router.js');

import Router from '../router';
var router = new Router();

const Nugegoda      = "45";
const Pepiliyana    = "233";
const Kohuwala      = "231";

describe('test2Route', () => {
    var fromRoutes  = router.findStopRoutes(Nugegoda);
    it('Routes from Nugegoda contains 163', () => {
        expect(fromRoutes).toContain("28");
    });

    it('Routes from Nugegoda contains 176', () => {
        expect(fromRoutes).toContain("29");
    });

    var toRoutes  = router.findStopRoutes(Pepiliyana);

    it('Routes from Pepiliyana contains 120s', () => {
        expect(toRoutes).toContain("12");
        expect(toRoutes).toContain("13");
        expect(toRoutes).toContain("14");
    });

    var fromStops = [], toStops = [];
    fromRoutes.forEach(function(fr) {
      fromStops = fromStops.concat(router.findReachableStops(fr, Nugegoda));
    });

    toRoutes.forEach(function(tr) {
      toStops = toStops.concat(router.findReachableStops(tr, Pepiliyana));
    });

    it('Kohuwala is reachable from Nugegoda', () => {
        expect(fromStops).toContain(Kohuwala);
    });

    it('Kohuwala is reachable from Pepiliyana', () => {
        expect(toStops).toContain(Kohuwala);
    });

    var common = router.intersect(fromStops, toStops);
    it('Kohuwala is reachable from both', () => {
        expect(common).toContain(Kohuwala);
    });

    var routes = router.findRoutes(Nugegoda, Pepiliyana, 500);
    it('Kohuwala is a valid changeover', () => {
        expect(routes[0].changes).toContain(Kohuwala);
    });
});