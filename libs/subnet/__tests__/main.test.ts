import { describe, it, expect } from "vitest";
import {
  parseIP,
  formatIP,
  parseCIDR,
  getIPClass,
  getAddressType,
  calculateCIDR,
  cidrToMask,
  maskToCidr,
  subnetSplitByCount,
  subnetSplitByHosts,
  vlsmAllocate,
  isSameSubnet,
  getBitsVisualization,
} from "../main";

describe("parseIP", () => {
  it("parses IPv4 decimal", () => {
    const result = parseIP("192.168.1.100");
    expect(result.version).toBe(4);
    expect(result.value).toBe(3232235876n);
  });

  it("parses IPv4 0.0.0.0", () => {
    const result = parseIP("0.0.0.0");
    expect(result.version).toBe(4);
    expect(result.value).toBe(0n);
  });

  it("parses IPv4 255.255.255.255", () => {
    const result = parseIP("255.255.255.255");
    expect(result.version).toBe(4);
    expect(result.value).toBe(4294967295n);
  });

  it("throws on invalid IPv4", () => {
    expect(() => parseIP("999.1.1.1")).toThrow();
    expect(() => parseIP("1.2.3")).toThrow();
    expect(() => parseIP("abc")).toThrow();
    expect(() => parseIP("")).toThrow();
  });

  it("parses IPv6 full form", () => {
    const result = parseIP("2001:0db8:0000:0000:0000:0000:0000:0001");
    expect(result.version).toBe(6);
    expect(result.value).toBe(0x20010db8000000000000000000000001n);
  });

  it("parses IPv6 abbreviated with ::", () => {
    const result = parseIP("2001:db8::1");
    expect(result.version).toBe(6);
    expect(result.value).toBe(0x20010db8000000000000000000000001n);
  });

  it("parses IPv6 :: (all zeros)", () => {
    const result = parseIP("::");
    expect(result.version).toBe(6);
    expect(result.value).toBe(0n);
  });

  it("parses IPv6 ::1 (loopback)", () => {
    const result = parseIP("::1");
    expect(result.version).toBe(6);
    expect(result.value).toBe(1n);
  });

  it("parses IPv6 with :: in middle", () => {
    const result = parseIP("fe80::1");
    expect(result.version).toBe(6);
    expect(result.value).toBe(0xfe800000000000000000000000000001n);
  });

  it("throws on invalid IPv6", () => {
    expect(() => parseIP("gggg::1")).toThrow();
    expect(() => parseIP("1:2:3:4:5:6:7:8:9")).toThrow();
  });
});

describe("formatIP", () => {
  it("formats IPv4", () => {
    expect(formatIP(3232235876n, 4)).toBe("192.168.1.100");
  });

  it("formats IPv4 0.0.0.0", () => {
    expect(formatIP(0n, 4)).toBe("0.0.0.0");
  });

  it("formats IPv6 with RFC 5952 abbreviation", () => {
    expect(formatIP(0x20010db8000000000000000000000001n, 6)).toBe("2001:db8::1");
  });

  it("formats IPv6 :: (all zeros)", () => {
    expect(formatIP(0n, 6)).toBe("::");
  });

  it("formats IPv6 ::1", () => {
    expect(formatIP(1n, 6)).toBe("::1");
  });

  it("formats IPv6 without compression (no zeros)", () => {
    expect(formatIP(0x20010db8abcd01234567000000000001n, 6)).toBe("2001:db8:abcd:123:4567::1");
  });

  it("formats IPv6 link-local", () => {
    expect(formatIP(0xfe800000000000000000000000000001n, 6)).toBe("fe80::1");
  });
});

describe("parseCIDR", () => {
  it("parses IPv4 CIDR", () => {
    const result = parseCIDR("192.168.1.0/24");
    expect(result.ip.version).toBe(4);
    expect(result.ip.value).toBe(3232235776n);
    expect(result.prefixLength).toBe(24);
  });

  it("parses IPv6 CIDR", () => {
    const result = parseCIDR("2001:db8::/32");
    expect(result.ip.version).toBe(6);
    expect(result.prefixLength).toBe(32);
  });

  it("throws on invalid prefix", () => {
    expect(() => parseCIDR("1.2.3.4/33")).toThrow();
    expect(() => parseCIDR("::1/129")).toThrow();
  });

  it("throws on missing prefix", () => {
    expect(() => parseCIDR("192.168.1.0")).toThrow();
  });
});

describe("getIPClass", () => {
  it("returns Class A for 10.x.x.x", () => {
    expect(getIPClass(parseIP("10.0.0.1"))).toBe("A");
  });
  it("returns Class B for 172.16.x.x", () => {
    expect(getIPClass(parseIP("172.16.0.1"))).toBe("B");
  });
  it("returns Class C for 192.168.x.x", () => {
    expect(getIPClass(parseIP("192.168.0.1"))).toBe("C");
  });
  it("returns Class D for 224.x.x.x", () => {
    expect(getIPClass(parseIP("224.0.0.1"))).toBe("D");
  });
  it("returns Class E for 240.x.x.x", () => {
    expect(getIPClass(parseIP("240.0.0.1"))).toBe("E");
  });
  it("returns null for IPv6", () => {
    expect(getIPClass(parseIP("2001:db8::1"))).toBeNull();
  });
});

describe("getAddressType", () => {
  it("classifies 10.x as private", () => {
    expect(getAddressType(parseIP("10.0.0.1"))).toBe("private");
    expect(getAddressType(parseIP("10.255.255.255"))).toBe("private");
  });

  it("classifies 172.16.x - 172.31.x as private", () => {
    expect(getAddressType(parseIP("172.16.0.1"))).toBe("private");
    expect(getAddressType(parseIP("172.31.255.255"))).toBe("private");
  });

  it("classifies 192.168.x as private", () => {
    expect(getAddressType(parseIP("192.168.0.1"))).toBe("private");
    expect(getAddressType(parseIP("192.168.255.255"))).toBe("private");
  });

  it("classifies 127.x as loopback", () => {
    expect(getAddressType(parseIP("127.0.0.1"))).toBe("loopback");
    expect(getAddressType(parseIP("127.255.255.255"))).toBe("loopback");
  });

  it("classifies 169.254.x as linkLocal", () => {
    expect(getAddressType(parseIP("169.254.0.1"))).toBe("linkLocal");
  });

  it("classifies 224.x as multicast", () => {
    expect(getAddressType(parseIP("224.0.0.1"))).toBe("multicast");
    expect(getAddressType(parseIP("239.255.255.255"))).toBe("multicast");
  });

  it("classifies 240.x as reserved", () => {
    expect(getAddressType(parseIP("240.0.0.1"))).toBe("reserved");
    expect(getAddressType(parseIP("255.255.255.255"))).toBe("reserved");
  });

  it("classifies public IPv4", () => {
    expect(getAddressType(parseIP("8.8.8.8"))).toBe("public");
    expect(getAddressType(parseIP("172.32.0.1"))).toBe("public");
  });

  it("classifies IPv6 ::1 as loopback", () => {
    expect(getAddressType(parseIP("::1"))).toBe("loopback");
  });

  it("classifies IPv6 fe80:: as linkLocal", () => {
    expect(getAddressType(parseIP("fe80::1"))).toBe("linkLocal");
  });

  it("classifies IPv6 fc00:: as private (ULA)", () => {
    expect(getAddressType(parseIP("fc00::1"))).toBe("private");
    expect(getAddressType(parseIP("fd00::1"))).toBe("private");
  });

  it("classifies IPv6 ff00:: as multicast", () => {
    expect(getAddressType(parseIP("ff00::1"))).toBe("multicast");
  });

  it("classifies IPv6 public", () => {
    expect(getAddressType(parseIP("2001:db8::1"))).toBe("public");
  });
});

describe("calculateCIDR", () => {
  it("calculates /24 typical", () => {
    const info = calculateCIDR("192.168.1.100/24");
    expect(info.networkAddress).toBe("192.168.1.0");
    expect(info.broadcastAddress).toBe("192.168.1.255");
    expect(info.firstHost).toBe("192.168.1.1");
    expect(info.lastHost).toBe("192.168.1.254");
    expect(info.totalHosts).toBe(256n);
    expect(info.usableHosts).toBe(254n);
    expect(info.subnetMask).toBe("255.255.255.0");
    expect(info.prefixLength).toBe(24);
    expect(info.ipClass).toBe("C");
    expect(info.addressType).toBe("private");
  });

  it("calculates /31 point-to-point (RFC 3021)", () => {
    const info = calculateCIDR("192.168.1.0/31");
    expect(info.networkAddress).toBe("192.168.1.0");
    expect(info.broadcastAddress).toBe("192.168.1.1");
    expect(info.firstHost).toBe("192.168.1.0");
    expect(info.lastHost).toBe("192.168.1.1");
    expect(info.usableHosts).toBe(2n);
    expect(info.totalHosts).toBe(2n);
  });

  it("calculates /32 single host", () => {
    const info = calculateCIDR("192.168.1.100/32");
    expect(info.networkAddress).toBe("192.168.1.100");
    expect(info.broadcastAddress).toBe("192.168.1.100");
    expect(info.firstHost).toBe("192.168.1.100");
    expect(info.lastHost).toBe("192.168.1.100");
    expect(info.usableHosts).toBe(1n);
    expect(info.totalHosts).toBe(1n);
  });

  it("calculates /0 full range", () => {
    const info = calculateCIDR("0.0.0.0/0");
    expect(info.networkAddress).toBe("0.0.0.0");
    expect(info.broadcastAddress).toBe("255.255.255.255");
    expect(info.totalHosts).toBe(4294967296n);
    expect(info.usableHosts).toBe(4294967294n);
  });

  it("calculates IPv6 /64", () => {
    const info = calculateCIDR("2001:db8::1/64");
    expect(info.version).toBe(6);
    expect(info.networkAddress).toBe("2001:db8::");
    expect(info.broadcastAddress).toBeNull();
    expect(info.firstHost).toBe("2001:db8::1");
    expect(info.lastHost).toBe("2001:db8::ffff:ffff:ffff:ffff");
    expect(info.totalHosts).toBe(1n << 64n);
    expect(info.usableHosts).toBe(1n << 64n);
    expect(info.subnetMask).toBe("");
    expect(info.ipClass).toBeNull();
  });

  it("calculates IPv6 /127 point-to-point", () => {
    const info = calculateCIDR("2001:db8::/127");
    expect(info.usableHosts).toBe(2n);
    expect(info.firstHost).toBe("2001:db8::");
    expect(info.lastHost).toBe("2001:db8::1");
  });

  it("calculates IPv6 /128 single host", () => {
    const info = calculateCIDR("2001:db8::1/128");
    expect(info.usableHosts).toBe(1n);
    expect(info.firstHost).toBe("2001:db8::1");
    expect(info.lastHost).toBe("2001:db8::1");
  });
});

describe("cidrToMask", () => {
  it("converts /24 to 255.255.255.0", () => {
    expect(cidrToMask(24, 4)).toBe("255.255.255.0");
  });
  it("converts /0 to 0.0.0.0", () => {
    expect(cidrToMask(0, 4)).toBe("0.0.0.0");
  });
  it("converts /32 to 255.255.255.255", () => {
    expect(cidrToMask(32, 4)).toBe("255.255.255.255");
  });
  it("returns empty string for IPv6", () => {
    expect(cidrToMask(64, 6)).toBe("");
  });
});

describe("maskToCidr", () => {
  it("converts 255.255.255.0 to /24", () => {
    expect(maskToCidr("255.255.255.0")).toBe(24);
  });
  it("converts 0.0.0.0 to /0", () => {
    expect(maskToCidr("0.0.0.0")).toBe(0);
  });
  it("converts 255.255.255.255 to /32", () => {
    expect(maskToCidr("255.255.255.255")).toBe(32);
  });
  it("converts 255.255.255.252 to /30", () => {
    expect(maskToCidr("255.255.255.252")).toBe(30);
  });
  it("throws on invalid mask", () => {
    expect(() => maskToCidr("255.0.255.0")).toThrow();
  });
});

describe("subnetSplitByCount", () => {
  it("splits /24 into 4 subnets", () => {
    const results = subnetSplitByCount("192.168.1.0", 24, 4);
    expect(results).toHaveLength(4);
    expect(results[0].networkAddress).toBe("192.168.1.0");
    expect(results[0].prefixLength).toBe(26);
    expect(results[0].broadcastAddress).toBe("192.168.1.63");
    expect(results[1].networkAddress).toBe("192.168.1.64");
    expect(results[1].broadcastAddress).toBe("192.168.1.127");
    expect(results[2].networkAddress).toBe("192.168.1.128");
    expect(results[3].networkAddress).toBe("192.168.1.192");
  });

  it("splits /16 into 256 /24 subnets", () => {
    const results = subnetSplitByCount("192.168.0.0", 16, 256);
    expect(results).toHaveLength(256);
    expect(results[0].networkAddress).toBe("192.168.0.0");
    expect(results[255].networkAddress).toBe("192.168.255.0");
    expect(results[0].prefixLength).toBe(24);
  });

  it("throws when insufficient space", () => {
    expect(() => subnetSplitByCount("192.168.1.0", 24, 1024)).toThrow();
  });

  it("splits IPv6", () => {
    const results = subnetSplitByCount("2001:db8::", 32, 4);
    expect(results).toHaveLength(4);
    expect(results[0].prefixLength).toBe(34);
    expect(results[0].networkAddress).toBe("2001:db8::");
    expect(results[1].networkAddress).toBe("2001:db8:4000::");
  });
});

describe("subnetSplitByHosts", () => {
  it("splits /24 with 30 hosts into 8 /27 subnets", () => {
    const results = subnetSplitByHosts("192.168.1.0", 24, 30);
    expect(results).toHaveLength(8);
    expect(results[0].prefixLength).toBe(27);
    expect(results[0].usableHosts).toBe(30n);
  });

  it("splits /24 with 2 hosts into 64 /30 subnets", () => {
    const results = subnetSplitByHosts("192.168.1.0", 24, 2);
    expect(results).toHaveLength(64);
    expect(results[0].prefixLength).toBe(30);
  });
});

describe("vlsmAllocate", () => {
  it("allocates 3 unequal subnets (first-fit decreasing)", () => {
    const entries = [
      { name: "Subnet A", requiredHosts: 100 },
      { name: "Subnet B", requiredHosts: 50 },
      { name: "Subnet C", requiredHosts: 10 },
    ];
    const results = vlsmAllocate("192.168.1.0", 24, entries);
    expect(results).toHaveLength(3);
    expect(results[0].name).toBe("Subnet A");
    expect(results[0].allocatedPrefix).toBe(25);
    expect(results[0].usableHosts).toBe(126n);
    expect(results[0].networkAddress).toBe("192.168.1.0");

    expect(results[1].name).toBe("Subnet B");
    expect(results[1].allocatedPrefix).toBe(26);
    expect(results[1].usableHosts).toBe(62n);
    expect(results[1].networkAddress).toBe("192.168.1.128");

    expect(results[2].name).toBe("Subnet C");
    expect(results[2].allocatedPrefix).toBe(28);
    expect(results[2].networkAddress).toBe("192.168.1.192");
  });

  it("preserves input order on ties", () => {
    const entries = [
      { name: "First", requiredHosts: 10 },
      { name: "Second", requiredHosts: 10 },
    ];
    const results = vlsmAllocate("10.0.0.0", 24, entries);
    expect(results[0].name).toBe("First");
    expect(results[1].name).toBe("Second");
  });

  it("throws when total exceeds parent", () => {
    const entries = [
      { name: "Big", requiredHosts: 200 },
      { name: "Also Big", requiredHosts: 200 },
    ];
    expect(() => vlsmAllocate("192.168.1.0", 24, entries)).toThrow();
  });
});

describe("isSameSubnet", () => {
  it("returns true for same subnet", () => {
    expect(isSameSubnet("192.168.1.1", "192.168.1.100", 24)).toBe(true);
  });

  it("returns false for different subnet", () => {
    expect(isSameSubnet("192.168.1.1", "192.168.2.1", 24)).toBe(false);
  });

  it("returns false for cross-boundary", () => {
    expect(isSameSubnet("192.168.1.127", "192.168.1.128", 25)).toBe(false);
  });

  it("works with IPv6", () => {
    expect(isSameSubnet("2001:db8::1", "2001:db8::100", 32)).toBe(true);
    expect(isSameSubnet("2001:db8::1", "2001:db9::1", 32)).toBe(false);
  });
});

describe("getBitsVisualization", () => {
  it("returns 32 bits for IPv4", () => {
    const vis = getBitsVisualization(0xc0a80164n, 24, 4);
    expect(vis.version).toBe(4);
    expect(vis.bits).toHaveLength(32);
    expect(vis.prefixLength).toBe(24);
    expect(vis.bits[0]).toBe("1");
    expect(vis.bits[1]).toBe("1");
    expect(vis.bits[2]).toBe("0");
  });

  it("returns 128 bits for IPv6", () => {
    const vis = getBitsVisualization(0x20010db8000000000000000000000001n, 32, 6);
    expect(vis.version).toBe(6);
    expect(vis.bits).toHaveLength(128);
    expect(vis.prefixLength).toBe(32);
  });

  it("correct boundary for /0", () => {
    const vis = getBitsVisualization(0n, 0, 4);
    expect(vis.prefixLength).toBe(0);
    expect(vis.bits.every((b) => b === "0")).toBe(true);
  });

  it("correct boundary for /32", () => {
    const vis = getBitsVisualization(0xffffffffn, 32, 4);
    expect(vis.prefixLength).toBe(32);
    expect(vis.bits.every((b) => b === "1")).toBe(true);
  });
});
